import { Namespace, Socket } from 'socket.io';
import uuid from 'uuid/v4';
import forEach from 'lodash/forEach';
import shuffle from 'lodash/shuffle';

import { EPlayerStatus, IGamePlayer } from 'common/types';
import {
  ECommonGameEvent,
  EGame,
  IGameData,
  TGameEvent,
  TGameEventData,
  TGameEventListener,
  TGameOptions,
} from 'common/types/game';

import ioSessionMiddleware from 'server/utilities/ioSessionMiddleware';
import { IEntityContext } from 'server/gamesData/Game/utilities/Entity';
import removeNamespace from 'server/utilities/removeNamespace';
import GameEntity from 'server/gamesData/Game/utilities/GameEntity';

import ioInstance from 'server/io';
import PexesoGame from 'server/gamesData/Game/PexesoGame/PexesoGame';
import SurvivalOnlineGame from 'server/gamesData/Game/SurvivalOnlineGame/SurvivalOnlineGame';
import SetGame from 'server/gamesData/Game/SetGame/SetGame';
import OnitamaGame from 'server/gamesData/Game/OnitamaGame/OnitamaGame';
import CarcassonneGame from 'server/gamesData/Game/CarcassonneGame/CarcassonneGame';
import SevenWondersGame from 'server/gamesData/Game/SevenWondersGame/SevenWondersGame';
import HeartsGame from 'server/gamesData/Game/HeartsGame/HeartsGame';

export interface IServerGamePlayer extends IGamePlayer {
  sockets: Set<Socket>;
}

export type TPlayerEventListener<Game extends EGame, Event extends TGameEvent<Game>> = (
  data: TGameEventData<Game, Event>,
  playerIndex: number,
) => unknown;

export interface IGameCreateOptions<Game extends EGame> {
  game: Game;
  name: string;
  options: TGameOptions<Game>;
  onDeleteGame(gameId: string): void;
  onUpdateGame(gameId: string): void;
}

interface IBatchedAction<Game extends EGame, Event extends TGameEvent<Game>> {
  event: Event;
  data: TGameEventData<Game, Event>;
  socket?: Socket;
}

export interface ISendSocketEventOptions {
  socket?: Socket;
  batch?: boolean;
}

const GAME_ENTITIES_MAP: {
  [Game in EGame]: { new (context: IEntityContext<Game>): GameEntity<Game> };
} = {
  [EGame.PEXESO]: PexesoGame,
  [EGame.SURVIVAL_ONLINE]: SurvivalOnlineGame,
  [EGame.SET]: SetGame,
  [EGame.ONITAMA]: OnitamaGame,
  [EGame.CARCASSONNE]: CarcassonneGame,
  [EGame.SEVEN_WONDERS]: SevenWondersGame,
  [EGame.HEARTS]: HeartsGame,
};

class Game<Game extends EGame> {
  io: Namespace;
  game: Game;
  id: string;
  name: string;
  players: IServerGamePlayer[];
  options: TGameOptions<Game>;
  gameEntity: GameEntity<Game> | null = null;
  deleted = false;
  batchedActions: IBatchedAction<Game, TGameEvent<Game>>[] = [];
  batchedActionsTimeout: NodeJS.Timeout | null = null;
  deleteGameTimeout: NodeJS.Timeout | null = null;
  onDeleteGame: (gameId: string) => void;
  onUpdateGame: (gameId: string) => void;

  temporaryListeners: {
    [Event in TGameEvent<Game>]?: Set<TGameEventListener<Game, Event>>;
  } = {};

  constructor({ game, name, options, onDeleteGame, onUpdateGame }: IGameCreateOptions<Game>) {
    this.game = game;
    this.id = uuid();
    this.name = name;
    this.options = options;
    this.players = [];
    this.io = ioInstance.of(`/${game}/game/${this.id}`);
    this.onDeleteGame = onDeleteGame;
    this.onUpdateGame = onUpdateGame;

    this.io.use(ioSessionMiddleware);
    this.io.on('connection', (socket) => {
      const user = socket.user;
      let player: IServerGamePlayer | undefined;

      if (user) {
        player = this.getPlayerByLogin(user.login);

        if (!this.hasStarted() && !player) {
          player = {
            ...user,
            status: EPlayerStatus.NOT_READY,
            index: this.players.length,
            sockets: new Set([]),
          };

          this.players.push(player);

          this.onUpdateGame(this.id);
        }

        if (player) {
          this.clearDeleteTimeout();
        }

        player?.sockets.add(socket);
      }

      forEach(this.temporaryListeners, (listeners, event) => {
        listeners?.forEach((listener) => {
          socket.on(event, listener);
        });
      });

      socket.on(ECommonGameEvent.TOGGLE_READY, () => {
        if (!player || this.hasStarted()) {
          return;
        }

        player.status = player.status === EPlayerStatus.READY ? EPlayerStatus.NOT_READY : EPlayerStatus.READY;

        if (this.players.every(({ status }) => status === EPlayerStatus.READY)) {
          this.start();
        } else {
          this.io.emit(ECommonGameEvent.UPDATE_PLAYERS, this.getClientPlayers());
        }

        this.onUpdateGame(this.id);
      });

      socket.on('disconnect', () => {
        if (!player) {
          return;
        }

        player.sockets.delete(socket);

        if (player.sockets.size > 0) {
          return;
        }

        let shouldDeleteGame: boolean;

        if (this.hasStarted()) {
          player.status = EPlayerStatus.DISCONNECTED;

          shouldDeleteGame = this.players.every(({ status }) => status === EPlayerStatus.DISCONNECTED);
        } else {
          this.players.splice(player.index);

          shouldDeleteGame = this.players.length === 0;
        }

        if (shouldDeleteGame) {
          this.setDeleteTimeout();
        }
      });

      this.sendGameData(socket);
    });

    this.setDeleteTimeout();
  }

  clearDeleteTimeout(): void {
    if (this.deleteGameTimeout) {
      clearTimeout(this.deleteGameTimeout);

      this.deleteGameTimeout = null;
    }
  }

  delete(): void {
    removeNamespace(this.io);

    this.onDeleteGame(this.id);

    this.deleted = true;

    this.gameEntity?.destroy();
  }

  end(): void {
    this.io.emit(ECommonGameEvent.END);
  }

  getPlayerByLogin(login: string | undefined): IServerGamePlayer | undefined {
    return this.players.find((player) => player.login === login);
  }

  getClientPlayers(): IGamePlayer[] {
    return this.players.map((player) => ({
      login: player.login,
      status: player.status,
      index: player.index,
    }));
  }

  hasStarted(): boolean {
    return Boolean(this.gameEntity);
  }

  initMainGameEntity(): GameEntity<Game> {
    const entity = new GAME_ENTITIES_MAP[this.game]({
      game: this,
    });

    (async () => {
      await entity.run();

      this.end();
    })().catch((err) => {
      if (!this.deleted) {
        console.log('Error in game', err);

        this.delete();
      }
    });

    return entity;
  }

  listenSocketEvent<Event extends TGameEvent<Game>>(
    event: Event,
    listener: TPlayerEventListener<Game, Event>,
    playerIndex?: number,
  ): () => void {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const game = this;

    const playerListener = function (this: Socket, data: TGameEventData<Game, Event>) {
      const socketPlayer = game.getPlayerByLogin(this.user?.login);

      if (!socketPlayer) {
        return;
      }

      if (playerIndex === undefined || socketPlayer.index === playerIndex) {
        listener(data, socketPlayer.index);
      }
    };

    this.io.sockets.forEach((socket) => {
      socket.on(event, playerListener as any);
    });

    (this.temporaryListeners[event] ||= new Set())?.add(playerListener);

    return () => {
      this.io.sockets.forEach((socket) => {
        socket.off(event, playerListener);
      });

      (this.temporaryListeners[event] ||= new Set())?.delete(playerListener);
    };
  }

  sendGameData(socket?: Socket): void {
    const gameData: IGameData<Game> = {
      name: this.name,
      info: this.gameEntity?.getGameInfo() ?? null,
      players: this.getClientPlayers(),
    };

    (socket ?? this.io).emit(ECommonGameEvent.GET_DATA, gameData);
  }

  sendSocketEvent<Event extends TGameEvent<Game>>(
    event: Event,
    data: TGameEventData<Game, Event>,
    options?: ISendSocketEventOptions,
  ): void {
    if (!options?.batch) {
      (options?.socket ?? this.io).emit(event, data);

      return;
    }

    const existingEventIndex = this.batchedActions.findIndex(
      (action) => action.event === event && action.socket === options.socket,
    );
    const batchedAction: IBatchedAction<Game, Event> = {
      event,
      data,
      socket: options.socket,
    };

    if (existingEventIndex === -1) {
      this.batchedActions.push(batchedAction);
    } else {
      this.batchedActions[existingEventIndex] = batchedAction;
    }

    if (!this.batchedActionsTimeout) {
      this.batchedActionsTimeout = setTimeout(() => {
        this.batchedActions.forEach(({ event, data, socket }) => {
          (socket ?? this.io).emit(event, data);
        });

        this.batchedActions = [];
        this.batchedActionsTimeout = null;
      }, 0);
    }
  }

  setDeleteTimeout(): void {
    this.deleteGameTimeout = setTimeout(() => this.delete(), 10000);
  }

  start(): void {
    this.players = shuffle(this.players);

    this.players.forEach((player, index) => {
      player.index = index;
      player.status = EPlayerStatus.PLAYING;
    });

    this.gameEntity = this.initMainGameEntity();

    this.sendGameData();
  }
}

export default Game;
