import forEach from 'lodash/forEach';
import pick from 'lodash/pick';
import shuffle from 'lodash/shuffle';
import times from 'lodash/times';
import uuid from 'uuid/v4';

import { SECOND } from 'common/constants/date';
import { BOTS_SUPPORTED_GAMES, PLAYER_SETTINGS } from 'common/constants/game';

import { CommonGameClientEvent, CommonGameServerEvent, GamePlayer, PlayerStatus } from 'common/types';
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
  GameType,
} from 'common/types/game';
import { GameNamespace, GameServerSocket } from 'common/types/socket';

import { areBotsAvailable } from 'common/utilities/bots';
import { BotConstructor } from 'server/gamesData/Game/utilities/BotEntity';
import { EntityContext } from 'server/gamesData/Game/utilities/Entity';
import GameEntity from 'server/gamesData/Game/utilities/GameEntity';
import ioSessionMiddleware from 'server/utilities/ioSessionMiddleware';
import removeNamespace from 'server/utilities/removeNamespace';
import { now } from 'server/utilities/time';

import HeartsBot from 'server/gamesData/Game/HeartsGame/HeartsBot';
import MahjongBot from 'server/gamesData/Game/MahjongGame/MahjongBot';
import SevenWondersBot from 'server/gamesData/Game/SevenWondersGame/SevenWondersBot';

import BombersGame from 'server/gamesData/Game/BombersGame/BombersGame';
import CarcassonneGame from 'server/gamesData/Game/CarcassonneGame/CarcassonneGame';
import HeartsGame from 'server/gamesData/Game/HeartsGame/HeartsGame';
import MachiKoroGame from 'server/gamesData/Game/MachiKoroGame/MachiKoroGame';
import MahjongGame from 'server/gamesData/Game/MahjongGame/MahjongGame';
import OnitamaGame from 'server/gamesData/Game/OnitamaGame/OnitamaGame';
import PexesoGame from 'server/gamesData/Game/PexesoGame/PexesoGame';
import SetGame from 'server/gamesData/Game/SetGame/SetGame';
import SevenWondersGame from 'server/gamesData/Game/SevenWondersGame/SevenWondersGame';
import SurvivalOnlineGame from 'server/gamesData/Game/SurvivalOnlineGame/SurvivalOnlineGame';
import ioInstance from 'server/io';

export interface ServerGamePlayer<Game extends GameType> extends GamePlayer<Game> {
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

const GAME_ENTITIES_MAP: {
  [Game in GameType]: { new (context: EntityContext<Game>): GameEntity<Game> };
} = {
  [GameType.PEXESO]: PexesoGame,
  [GameType.SURVIVAL_ONLINE]: SurvivalOnlineGame,
  [GameType.SET]: SetGame,
  [GameType.ONITAMA]: OnitamaGame,
  [GameType.CARCASSONNE]: CarcassonneGame,
  [GameType.SEVEN_WONDERS]: SevenWondersGame,
  [GameType.HEARTS]: HeartsGame,
  [GameType.BOMBERS]: BombersGame,
  [GameType.MACHI_KORO]: MachiKoroGame,
  [GameType.MAHJONG]: MahjongGame,
};

export const BOTS: { [Game in typeof BOTS_SUPPORTED_GAMES[number]]: BotConstructor<Game> } = {
  [GameType.SEVEN_WONDERS]: SevenWondersBot,
  [GameType.HEARTS]: HeartsBot,
  [GameType.MAHJONG]: MahjongBot,
};

const BOT_NAMES = ['Jack', 'Jane', 'Bob', 'Mary', 'David', 'Sue', 'Greg', 'Rachel'];

class Game<Game extends GameType> {
  io: GameNamespace<Game>;
  game: Game;
  id: string;
  name: string;
  players: ServerGamePlayer<Game>[];
  options: GameOptions<Game>;
  gameEntity: GameEntity<Game> | null = null;
  result: GameResult<Game> | null = null;
  state: GameState = {
    type: 'active',
    changeTimestamp: 0,
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
        if (!this.hasStarted() && !player && this.players.length < this.options.maxPlayersCount) {
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
        }
      }

      if (this.hasStarted() && player) {
        player.status = PlayerStatus.PLAYING;
      }

      player?.sockets.add(socket);

      forEach(this.temporaryListeners, (listeners, event) => {
        listeners?.forEach((listener) => {
          socket.on(event as any, listener as any);
        });
      });

      (socket as GameServerSocket<GameType>).on(CommonGameClientEvent.TOGGLE_PAUSE, () => {
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
          this.sendSocketEvent(CommonGameServerEvent.PAUSE, timestamp);
        } else {
          this.gameEntity.unpause(timestamp);
          this.sendSocketEvent(CommonGameServerEvent.UNPAUSE, timestamp);
        }
      });

      (socket as GameServerSocket<GameType>).on(CommonGameClientEvent.TOGGLE_READY, () => {
        if (!player || this.hasStarted()) {
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
          player.status = PlayerStatus.DISCONNECTED;

          shouldDeleteGame = this.players.every(({ status, isBot }) => status === PlayerStatus.DISCONNECTED || isBot);
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

  addPlayer(playerData: Omit<GamePlayer<Game>, 'index'>): ServerGamePlayer<Game> {
    const player: ServerGamePlayer<Game> = {
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

  end(result: GameResult<Game>): void {
    this.result = result;

    this.sendSocketEvent(CommonGameServerEvent.END, result);
  }

  getClientPlayers(): GamePlayer<Game>[] {
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

  sendGameData(socket?: GameServerSocket<Game>): void {
    const gameData: GameData<Game> = {
      name: this.name,
      options: this.options,
      info: this.gameEntity?.getGameInfo() ?? null,
      result: this.result,
      players: this.getClientPlayers(),
      timestamp: now(),
      state: this.state,
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

  setDeleteTimeout(): void {
    this.deleteGameTimeout = setTimeout(() => this.delete(), 10 * SECOND);
  }

  start(): void {
    this.players = shuffle(this.players);

    this.players.forEach((player, index) => {
      player.index = index;
      player.status = PlayerStatus.PLAYING;
    });

    this.gameEntity = this.initMainGameEntity();

    this.sendGameData();
  }
}

export default Game;
