import uuid from 'uuid/v4';
import forEach from 'lodash/forEach';
import shuffle from 'lodash/shuffle';
import pick from 'lodash/pick';
import times from 'lodash/times';

import { BOTS_SUPPORTED_GAMES, PLAYER_SETTINGS } from 'common/constants/games/common';

import { ECommonGameClientEvent, ECommonGameServerEvent, EPlayerStatus, IGamePlayer } from 'common/types';
import {
  EGame,
  IGameData,
  IGameState,
  TGameClientEvent,
  TGameClientEventData,
  TGameClientEventListener,
  TGameOptions,
  TGameResult,
  TGameServerEvent,
  TGameServerEventData,
} from 'common/types/game';
import { TGameNamespace, TGameServerSocket } from 'common/types/socket';

import ioSessionMiddleware from 'server/utilities/ioSessionMiddleware';
import { IEntityContext } from 'server/gamesData/Game/utilities/Entity';
import removeNamespace from 'server/utilities/removeNamespace';
import GameEntity from 'server/gamesData/Game/utilities/GameEntity';
import { IBotConstructor } from 'server/gamesData/Game/utilities/BotEntity';
import { now } from 'server/utilities/time';
import { areBotsAvailable } from 'common/utilities/bots';

import SevenWondersBot from 'server/gamesData/Game/SevenWondersGame/SevenWondersBot';
import HeartsBot from 'server/gamesData/Game/HeartsGame/HeartsBot';
import MahjongBot from 'server/gamesData/Game/MahjongGame/MahjongBot';

import ioInstance from 'server/io';
import PexesoGame from 'server/gamesData/Game/PexesoGame/PexesoGame';
import SurvivalOnlineGame from 'server/gamesData/Game/SurvivalOnlineGame/SurvivalOnlineGame';
import SetGame from 'server/gamesData/Game/SetGame/SetGame';
import OnitamaGame from 'server/gamesData/Game/OnitamaGame/OnitamaGame';
import CarcassonneGame from 'server/gamesData/Game/CarcassonneGame/CarcassonneGame';
import SevenWondersGame from 'server/gamesData/Game/SevenWondersGame/SevenWondersGame';
import HeartsGame from 'server/gamesData/Game/HeartsGame/HeartsGame';
import BombersGame from 'server/gamesData/Game/BombersGame/BombersGame';
import MachiKoroGame from 'server/gamesData/Game/MachiKoroGame/MachiKoroGame';
import MahjongGame from 'server/gamesData/Game/MahjongGame/MahjongGame';

export interface IServerGamePlayer<Game extends EGame> extends IGamePlayer<Game> {
  sockets: Set<TGameServerSocket<Game>>;
}

export type TPlayerClientEventListener<Game extends EGame, Event extends TGameClientEvent<Game>> = (
  data: TGameClientEventData<Game, Event>,
  playerIndex: number,
) => unknown;

export interface IGameCreateOptions<Game extends EGame> {
  game: Game;
  name: string;
  options: TGameOptions<Game>;
  onDeleteGame(gameId: string): void;
  onUpdateGame(gameId: string): void;
}

interface IBatchedAction<Game extends EGame, Event extends TGameServerEvent<Game>> {
  event: Event;
  data: TGameServerEventData<Game, Event>;
  socket?: TGameServerSocket<Game>;
}

export interface ISendSocketEventOptions<Game extends EGame> {
  socket?: TGameServerSocket<Game>;
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
  [EGame.BOMBERS]: BombersGame,
  [EGame.MACHI_KORO]: MachiKoroGame,
  [EGame.MAHJONG]: MahjongGame,
};

export const BOTS: { [Game in typeof BOTS_SUPPORTED_GAMES[number]]: IBotConstructor<Game> } = {
  [EGame.SEVEN_WONDERS]: SevenWondersBot,
  [EGame.HEARTS]: HeartsBot,
  [EGame.MAHJONG]: MahjongBot,
};

const BOT_NAMES = ['Jack', 'Jane', 'Bob', 'Mary', 'David', 'Sue', 'Greg', 'Rachel'];

class Game<Game extends EGame> {
  io: TGameNamespace<Game>;
  game: Game;
  id: string;
  name: string;
  players: IServerGamePlayer<Game>[];
  options: TGameOptions<Game>;
  gameEntity: GameEntity<Game> | null = null;
  result: TGameResult<Game> | null = null;
  state: IGameState = {
    type: 'active',
    changeTimestamp: 0,
  };
  deleted = false;
  batchedActions: IBatchedAction<Game, TGameServerEvent<Game>>[] = [];
  batchedActionsTimeout: NodeJS.Timeout | null = null;
  deleteGameTimeout: NodeJS.Timeout | null = null;
  onDeleteGame: (gameId: string) => void;
  onUpdateGame: (gameId: string) => void;

  temporaryListeners: {
    [Event in TGameClientEvent<Game>]?: Set<TGameClientEventListener<Game, Event>>;
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
    this.io.use((socket, next) => {
      try {
        socket.playerSettings = JSON.parse(String(socket.handshake.query.settings));
      } catch (err) {
        return next(new Error('Wrong player settings'));
      }

      next();
    });
    this.io.on('connection', (socket) => {
      const user = socket.user;
      let player = this.getSocketPlayer(socket);

      if (user) {
        if (!this.hasStarted() && !player && this.players.length < this.options.maxPlayersCount) {
          player = this.addPlayer({
            ...user,
            name: user.login,
            status: EPlayerStatus.NOT_READY,
            isBot: false,
            settings: socket.playerSettings as any,
          });

          this.sendUpdatePlayersEvent();
          this.onUpdateGame(this.id);
        }

        if (player) {
          this.clearDeleteTimeout();
        }
      }

      if (this.hasStarted() && player) {
        player.status = EPlayerStatus.PLAYING;
      }

      player?.sockets.add(socket);

      forEach(this.temporaryListeners, (listeners, event) => {
        listeners?.forEach((listener) => {
          socket.on(event as any, listener as any);
        });
      });

      (socket as TGameServerSocket<EGame>).on(ECommonGameClientEvent.TOGGLE_PAUSE, () => {
        if (!player || !this.hasStarted() || !this.gameEntity?.isPauseSupported()) {
          return;
        }

        const timestamp = now();

        this.state = {
          type: this.state.type === 'active' ? 'paused' : 'active',
          changeTimestamp: timestamp,
        };

        if (this.state.type === 'paused') {
          this.gameEntity.pause(timestamp);
          this.sendSocketEvent(ECommonGameServerEvent.PAUSE, timestamp);
        } else {
          this.gameEntity.unpause(timestamp);
          this.sendSocketEvent(ECommonGameServerEvent.UNPAUSE, timestamp);
        }
      });

      (socket as TGameServerSocket<EGame>).on(ECommonGameClientEvent.TOGGLE_READY, () => {
        if (!player || this.hasStarted()) {
          return;
        }

        player.status = player.status === EPlayerStatus.READY ? EPlayerStatus.NOT_READY : EPlayerStatus.READY;

        let isEnoughPlayers = false;

        if (this.players.every(({ status }) => status === EPlayerStatus.READY)) {
          isEnoughPlayers = this.players.length >= this.options.minPlayersCount;

          if (!isEnoughPlayers && this.areBotsAvailable()) {
            const botNames = shuffle(BOT_NAMES);

            times(this.options.minPlayersCount - this.players.length, (index) => {
              this.addPlayer({
                login: `bot-${index}`,
                name: botNames[index],
                status: EPlayerStatus.READY,
                isBot: true,
                settings: PLAYER_SETTINGS[this.game],
              });
            });

            isEnoughPlayers = true;
          }
        }

        if (isEnoughPlayers) {
          this.start();
        } else {
          this.sendUpdatePlayersEvent();
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

          shouldDeleteGame = this.players.every(({ status, isBot }) => status === EPlayerStatus.DISCONNECTED || isBot);
        } else {
          this.players.splice(player.index, 1);

          this.sendUpdatePlayersEvent();
          this.onUpdateGame(this.id);

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

  addPlayer(playerData: Omit<IGamePlayer<Game>, 'index'>): IServerGamePlayer<Game> {
    const player: IServerGamePlayer<Game> = {
      ...playerData,
      index: this.players.length,
      sockets: new Set(),
    };

    this.players.push(player);

    return player;
  }

  areBotsAvailable(): boolean {
    return Boolean(this.options.useBots && areBotsAvailable(this.game));
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

  end(result: TGameResult<Game>): void {
    this.result = result;

    this.sendSocketEvent(ECommonGameServerEvent.END, result);
  }

  getClientPlayers(): IGamePlayer<Game>[] {
    return this.players.map((player) => pick(player, ['login', 'name', 'status', 'index', 'isBot', 'settings']));
  }

  getSocketPlayer(socket: TGameServerSocket<Game>): IServerGamePlayer<Game> | undefined {
    const user = socket.user;

    if (user) {
      return this.players.find(({ login }) => user.login === login);
    }

    const botIndex = Number(socket.handshake.query.botIndex);

    return this.players[botIndex];
  }

  hasStarted(): boolean {
    return Boolean(this.gameEntity);
  }

  initMainGameEntity(): GameEntity<Game> {
    const entity = new GAME_ENTITIES_MAP[this.game]({
      game: this,
    });

    entity.run(
      (result) => this.end(result),
      (err) => {
        if (!this.deleted) {
          console.log('Error in game', err);

          this.delete();
        }
      },
    );

    return entity;
  }

  listenSocketEvent<Event extends TGameClientEvent<Game>>(
    event: Event,
    listener: TPlayerClientEventListener<Game, Event>,
    playerIndex?: number,
  ): () => void {
    const game = this;

    const playerListener = function (this: TGameServerSocket<Game>, data: TGameClientEventData<Game, Event>) {
      const socketPlayer = game.getSocketPlayer(this);

      if (!socketPlayer) {
        return;
      }

      if (playerIndex === undefined || socketPlayer.index === playerIndex) {
        listener(data, socketPlayer.index);
      }
    };

    const { sockets } = playerIndex === undefined ? this.io : this.players[playerIndex];

    sockets.forEach((socket) => {
      socket.on(event, playerListener as any);
    });

    (this.temporaryListeners[event] ||= new Set())?.add(playerListener);

    return () => {
      sockets.forEach((socket) => {
        socket.off(event, playerListener);
      });

      (this.temporaryListeners[event] ||= new Set())?.delete(playerListener);
    };
  }

  sendGameData(socket?: TGameServerSocket<Game>): void {
    const gameData: IGameData<Game> = {
      name: this.name,
      options: this.options,
      info: this.gameEntity?.getGameInfo() ?? null,
      result: this.result,
      players: this.getClientPlayers(),
      timestamp: now(),
      state: this.state,
    };

    this.sendSocketEvent(ECommonGameServerEvent.GET_DATA, gameData as any, {
      socket,
      batch: true,
    });
  }

  sendSocketEvent<Event extends TGameServerEvent<Game>>(
    event: Event,
    data: TGameServerEventData<Game, Event>,
    options?: ISendSocketEventOptions<Game>,
  ): void {
    if (!options?.batch) {
      // @ts-ignore
      (options?.socket ?? this.io).emit(event, data as any);

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
          // @ts-ignore
          (socket ?? this.io).emit(event, data);
        });

        this.batchedActions = [];
        this.batchedActionsTimeout = null;
      }, 0);
    }
  }

  sendUpdatePlayersEvent(): void {
    this.sendSocketEvent(ECommonGameServerEvent.UPDATE_PLAYERS, this.getClientPlayers() as any);
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
