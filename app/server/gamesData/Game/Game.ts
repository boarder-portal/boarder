import { Namespace, Socket } from 'socket.io';
import uuid from 'uuid/v4';
import forEach from 'lodash/forEach';
import shuffle from 'lodash/shuffle';

import { EPlayerStatus, IGamePlayer } from 'common/types';
import {
  EGame,
  ECommonGameEvent,
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

export type TPlayerEventListener<Game extends EGame, Event extends TGameEvent<Game>> = (
  data: TGameEventData<Game, Event>,
  playerIndex: number,
) => unknown;

export interface IGameCreateOptions<Game extends EGame> {
  game: Game;
  options: TGameOptions<Game>;
  players: IGamePlayer[];
  onDeleteGame(): void;
}

interface IBatchedAction<Game extends EGame, Event extends TGameEvent<Game>> {
  event: Event;
  data: TGameEventData<Game, Event>;
  socket?: Socket;
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
  players: IGamePlayer[];
  options: TGameOptions<Game>;
  gameEntity: GameEntity<Game>;
  deleted = false;
  batchedActions: IBatchedAction<Game, TGameEvent<Game>>[] = [];
  batchedActionsTimeout: NodeJS.Timeout | null = null;
  onDeleteGame: () => void;

  temporaryListeners: {
    [Event in TGameEvent<Game>]?: Set<TGameEventListener<Game, Event>>;
  } = {};

  constructor({ game, options, players, onDeleteGame }: IGameCreateOptions<Game>) {
    this.game = game;
    this.id = uuid();
    this.options = options;
    this.players = shuffle(players).map((player, index) => ({
      ...player,
      index,
    }));
    this.io = ioInstance.of(`/${game}/game/${this.id}`);
    this.onDeleteGame = onDeleteGame;

    let deleteGameTimeout: NodeJS.Timeout | null = setTimeout(() => this.delete(), 10000);

    this.io.use(ioSessionMiddleware);
    this.io.on('connection', (socket) => {
      const user = socket.user;

      if (user) {
        const player = this.getPlayerByLogin(user.login);

        if (player) {
          if (deleteGameTimeout) {
            clearTimeout(deleteGameTimeout);

            deleteGameTimeout = null;
          }

          player.status = EPlayerStatus.PLAYING;
        }
      }

      forEach(this.temporaryListeners, (listeners, event) => {
        listeners?.forEach((listener) => {
          socket.on(event, listener);
        });
      });

      socket.on('disconnect', () => {
        if (!user) {
          return;
        }

        const player = this.getPlayerByLogin(user.login);

        if (!player) {
          return;
        }

        player.status = EPlayerStatus.DISCONNECTED;

        if (this.players.every(({ status }) => status === EPlayerStatus.DISCONNECTED)) {
          deleteGameTimeout = setTimeout(() => this.delete(), 10000);
        }
      });

      this.gameEntity.sendGameInfo(socket);
    });

    this.gameEntity = this.initMainGameEntity();
  }

  delete(): void {
    removeNamespace(this.io);

    this.onDeleteGame();

    this.deleted = true;

    this.gameEntity.destroy();
  }

  end(): void {
    this.io.emit(ECommonGameEvent.END);
  }

  getPlayerByLogin(login: string | undefined): IGamePlayer | undefined {
    return this.players.find((player) => player.login === login);
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

  sendSocketEvent<Event extends TGameEvent<Game>>(
    event: Event,
    data: TGameEventData<Game, Event>,
    socket?: Socket,
  ): void {
    const existingEventIndex = this.batchedActions.findIndex(
      (action) => action.event === event && action.socket === socket,
    );
    const batchedAction: IBatchedAction<Game, Event> = {
      event,
      data,
      socket,
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
}

export default Game;
