import forEach from 'lodash/forEach';
import pick from 'lodash/pick';
import shuffle from 'lodash/shuffle';
import times from 'lodash/times';
import uuid from 'uuid/v4';

import { SECOND } from 'common/constants/date';
import { DEFAULT_DESTROY_ON_LEAVE, DEFAULT_USE_BOTS, PLAYER_SETTINGS } from 'common/constants/game';

import { BaseGamePlayer, CommonGameClientEvent, CommonGameServerEvent, PlayerStatus } from 'common/types';
import {
  GameClientEvent,
  GameClientEventData,
  GameClientEventListener,
  GameData,
  GameOptions,
  GameResult,
  GameServerEvent,
  GameServerEventData,
  GameState,
  GameStatus,
  GameType,
  PauseReason,
} from 'common/types/game';
import { GameNamespace, GameServerSocket } from 'common/types/socket';

import { areBotsAvailable } from 'common/utilities/bots';
import { now } from 'common/utilities/time';
import Entity from 'server/gamesData/Game/utilities/Entity/Entity';
import GameRoot from 'server/gamesData/Game/utilities/Entity/entities/GameRoot';
import { removeNamespace } from 'server/utilities/io';

import ioInstance from 'server/io';
import { ioSessionMiddleware } from 'server/middlewares/session';

export interface ServerGamePlayer<Game extends GameType> extends BaseGamePlayer<Game> {
  sockets: Set<GameServerSocket<Game>>;
}

export type PlayerClientEventListener<Game extends GameType, Event extends GameClientEvent<Game>> = (
  data: GameClientEventData<Game, Event>,
  playerIndex: number,
) => unknown;

export interface GameCreateOptions<Game extends GameType> {
  game: Game;
  name: string;
  options: GameOptions<Game>;
  onDeleteGame(gameId: string): void;
  onUpdateGame(gameId: string): void;
}

interface BatchedAction<Game extends GameType, Event extends GameServerEvent<Game>> {
  event: Event;
  data: GameServerEventData<Game, Event>;
  socket?: GameServerSocket<Game>;
}

export interface SendSocketEventOptions<Game extends GameType> {
  socket?: GameServerSocket<Game>;
  batch?: boolean;
}

const BOT_NAMES = ['Jack', 'Jane', 'Bob', 'Mary', 'David', 'Sue', 'Greg', 'Rachel'];

class Game<Game extends GameType> {
  io: GameNamespace<Game>;
  game: Game;
  id: string;
  name: string;
  status: GameStatus = GameStatus.WAITING;
  players: ServerGamePlayer<Game>[];
  options: GameOptions<Game>;
  rootEntity: GameRoot<Game> | null = null;
  result: GameResult<Game> | null = null;
  state: GameState = {
    type: 'active',
    changeTimestamp: now(),
  };
  deleted = false;
  batchedActions: BatchedAction<Game, GameServerEvent<Game>>[] = [];
  batchedActionsTimeout: NodeJS.Timeout | null = null;
  deleteGameTimeout: NodeJS.Timeout | null = null;
  onDeleteGame: (gameId: string) => void;
  onUpdateGame: (gameId: string) => void;

  temporaryListeners: {
    [Event in GameClientEvent<Game>]?: Set<GameClientEventListener<Game, Event>>;
  } = {};

  constructor({ game, name, options, onDeleteGame, onUpdateGame }: GameCreateOptions<Game>) {
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
        if (this.status === GameStatus.WAITING && !player && this.players.length < this.options.maxPlayersCount) {
          player = this.addPlayer({
            ...user,
            name: user.login,
            status: PlayerStatus.NOT_READY,
            isBot: false,
            settings: socket.playerSettings as any,
          });

          this.sendUpdatePlayersEvent();
          this.onUpdateGame(this.id);
        }

        if (player) {
          this.clearDeleteTimeout();

          if (this.state.type === 'paused' && this.state.pauseReason === 'noActivity') {
            this.unpause();
          }
        }
      }

      player?.sockets.add(socket);

      forEach(this.temporaryListeners, (listeners, event) => {
        listeners?.forEach((listener) => {
          socket.on(event as any, listener as any);
        });
      });

      (socket as GameServerSocket<GameType>).on(CommonGameClientEvent.PAUSE, () => {
        if (!player) {
          return;
        }

        this.pause('user');
      });

      (socket as GameServerSocket<GameType>).on(CommonGameClientEvent.UNPAUSE, () => {
        if (!player) {
          return;
        }

        this.unpause();
      });

      (socket as GameServerSocket<GameType>).on(CommonGameClientEvent.TOGGLE_READY, () => {
        if (!player || this.status !== GameStatus.WAITING) {
          return;
        }

        player.status = player.status === PlayerStatus.READY ? PlayerStatus.NOT_READY : PlayerStatus.READY;

        let isEnoughPlayers = false;

        if (this.players.every(({ status }) => status === PlayerStatus.READY)) {
          isEnoughPlayers = this.players.length >= this.options.minPlayersCount;

          if (!isEnoughPlayers && this.areBotsAvailable()) {
            const botNames = shuffle(BOT_NAMES);

            times(this.options.minPlayersCount - this.players.length, (index) => {
              this.addPlayer({
                login: `bot-${index}`,
                name: botNames[index],
                status: PlayerStatus.READY,
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
      });

      socket.on('disconnect', () => {
        if (!player) {
          return;
        }

        player.sockets.delete(socket);

        if (player.sockets.size > 0) {
          return;
        }

        if (this.hasStarted()) {
          player.status = PlayerStatus.DISCONNECTED;
        } else {
          this.players.splice(player.index, 1);

          this.sendUpdatePlayersEvent();
          this.onUpdateGame(this.id);
        }

        if (this.players.every(({ status, isBot }) => status === PlayerStatus.DISCONNECTED || isBot)) {
          this.setDeleteTimeout();

          if (this.state.type === 'active') {
            this.pause('noActivity');
          }
        }
      });

      this.sendGameData(socket);
    });

    this.setDeleteTimeout();
  }

  addPlayer(playerData: Omit<BaseGamePlayer<Game>, 'index'>): ServerGamePlayer<Game> {
    const player: ServerGamePlayer<Game> = {
      ...playerData,
      index: this.players.length,
      sockets: new Set(),
    };

    this.players.push(player);

    return player;
  }

  areBotsAvailable(): boolean {
    const { useBots = DEFAULT_USE_BOTS } = this.options;

    return useBots && areBotsAvailable(this.game);
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

    this.rootEntity?.destroy();
  }

  end(result: GameResult<Game>): void {
    this.status = GameStatus.GAME_ENDED;
    this.result = result;

    this.onUpdateGame(this.id);

    this.sendSocketEvent(CommonGameServerEvent.END, result);
  }

  getClientPlayers(): BaseGamePlayer<Game>[] {
    return this.players.map((player) => pick(player, ['login', 'name', 'status', 'index', 'isBot', 'settings']));
  }

  getSocketPlayer(socket: GameServerSocket<Game>): ServerGamePlayer<Game> | undefined {
    const user = socket.user;

    if (user) {
      return this.players.find(({ login }) => user.login === login);
    }

    const botIndex = Number(socket.handshake.query.botIndex);

    return this.players[botIndex];
  }

  hasStarted(): boolean {
    return Boolean(this.rootEntity);
  }

  initRootEntity(): GameRoot<Game> {
    const entity = Entity.spawnRoot(GameRoot<Game>, {
      context: {
        game: this,
      },
    });

    entity.subscribe(
      (result) => this.end(result),
      (err) => {
        if (!this.deleted) {
          console.log(
            new Error(`Error in ${this.game} game`, {
              cause: err,
            }),
          );

          this.delete();
        }
      },
    );

    return entity;
  }

  listenSocketEvent<Event extends GameClientEvent<Game>>(
    event: Event,
    listener: PlayerClientEventListener<Game, Event>,
    playerIndex?: number,
  ): () => void {
    const game = this;

    const playerListener = function (this: GameServerSocket<Game>, data: GameClientEventData<Game, Event>) {
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

  pause(pauseReason: PauseReason): void {
    if (this.status !== GameStatus.GAME_IN_PROGRESS || !this.rootEntity?.isPauseAvailable()) {
      return;
    }

    const pausedAt = now();

    this.state = {
      type: 'paused',
      pauseReason,
      changeTimestamp: pausedAt,
    };

    this.rootEntity?.pause(pausedAt);

    this.sendUpdateStateEvent();
  }

  sendGameData(socket?: GameServerSocket<Game>): void {
    const gameData: GameData<Game> = {
      name: this.name,
      options: this.options,
      info: this.rootEntity?.getGameInfo() ?? null,
      result: this.result,
      players: this.getClientPlayers(),
      timestamp: now(),
      state: this.state,
      status: this.status,
    };

    this.sendSocketEvent(CommonGameServerEvent.GET_DATA, gameData as any, {
      socket,
      batch: true,
    });
  }

  sendSocketEvent<Event extends GameServerEvent<Game>>(
    event: Event,
    data: GameServerEventData<Game, Event>,
    options?: SendSocketEventOptions<Game>,
  ): void {
    if (!options?.batch) {
      // @ts-ignore
      (options?.socket ?? this.io).emit(event, data as any);

      return;
    }

    const existingEventIndex = this.batchedActions.findIndex(
      (action) => action.event === event && action.socket === options.socket,
    );

    const batchedAction: BatchedAction<Game, Event> = {
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
    this.sendSocketEvent(CommonGameServerEvent.UPDATE_PLAYERS, this.getClientPlayers() as any);
  }

  sendUpdateStateEvent(): void {
    this.sendSocketEvent(CommonGameServerEvent.UPDATE_STATE, this.state);
  }

  setDeleteTimeout(): void {
    const { destroyOnLeave = DEFAULT_DESTROY_ON_LEAVE } = this.options;

    if (destroyOnLeave || this.status !== GameStatus.GAME_IN_PROGRESS) {
      this.deleteGameTimeout = setTimeout(() => this.delete(), 10 * SECOND);
    }
  }

  start(): void {
    this.status = GameStatus.GAME_IN_PROGRESS;
    this.players = shuffle(this.players);

    this.players.forEach((player, index) => {
      player.index = index;
      player.status = PlayerStatus.PLAYING;
    });

    this.rootEntity = this.initRootEntity();

    this.onUpdateGame(this.id);
    this.sendGameData();
  }

  unpause(): void {
    const unpausedAt = now();

    this.state = {
      type: 'active',
      changeTimestamp: unpausedAt,
    };

    this.rootEntity?.unpause(unpausedAt);

    this.sendUpdateStateEvent();
  }
}

export default Game;
