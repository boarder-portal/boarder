import { Namespace, Socket } from 'socket.io';
import uuid from 'uuid/v4';
import forEach from 'lodash/forEach';
import shuffle from 'lodash/shuffle';

import { IAuthSocket, IGameEvent } from 'server/types';
import { EPlayerStatus, IPlayer } from 'common/types';
import {
  EGame,
  ECommonGameEvent,
  IGameUpdateEvent,
  TGameEvent,
  TGameEventData,
  TGameEventListener,
  TGameOptions,
  TGamePlayer,
} from 'common/types/game';

import ioSessionMiddleware from 'server/utilities/ioSessionMiddleware';
import GameEntity from 'server/gamesData/Game/utilities/GameEntity';

import ioInstance from 'server/io';

export type TEventHandlers<Game extends EGame> = Partial<Record<TGameEvent<Game>, (event: IGameEvent<any>) => void>>;

export type TPlayerEventListener<Game extends EGame, Event extends TGameEvent<Game>> = (
  data: TGameEventData<Game, Event>,
  player: TGamePlayer<Game>,
) => unknown;

export interface IGameCreateOptions<Game extends EGame> {
  game: Game;
  options: TGameOptions<Game>;
  players: IPlayer[];
  onDeleteGame(): void;
}

interface IBatchedAction<Game extends EGame, Event extends TGameEvent<Game>> {
  event: Event;
  data: TGameEventData<Game, Event>;
  socket?: Socket;
}

abstract class Game<Game extends EGame> {
  io: Namespace;
  game: Game;
  id: string;
  players: TGamePlayer<Game>[];
  options: TGameOptions<Game>;
  deleted = false;
  batchedActions: IBatchedAction<Game, TGameEvent<Game>>[] = [];
  batchedActionsTimeout: NodeJS.Timeout | null = null;
  onDeleteGame: () => void;

  abstract handlers: TEventHandlers<Game>;

  temporaryListeners: {
    [Event in TGameEvent<Game>]?: Set<TGameEventListener<Game, Event>>;
  } = {};

  constructor({ game, options, players, onDeleteGame }: IGameCreateOptions<Game>) {
    this.game = game;
    this.id = uuid();
    this.options = options;
    this.players = shuffle(players).map((player, index) => (
      this.createPlayer({
        ...player,
        index,
      }, index)
    ));
    this.io = ioInstance.of(`/${game}/game/${this.id}`);
    this.onDeleteGame = onDeleteGame;

    let deleteGameTimeout: NodeJS.Timeout | null = setTimeout(() => this.delete(), 10000);

    this.io.use(ioSessionMiddleware as any);
    this.io.on('connection', (socket: IAuthSocket) => {
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

      this.sendBaseGameInfo();

      forEach(this.handlers, (handler, event) => {
        socket.on(event, (data) => {
          handler?.call(this, { socket, data });
        });
      });

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

        this.sendBaseGameInfo();

        if (this.players.every(({ status }) => status === EPlayerStatus.DISCONNECTED)) {
          deleteGameTimeout = setTimeout(() => this.delete(), 10000);
        }
      });
    });
  }

  abstract createPlayer(roomPlayer: IPlayer, index: number): TGamePlayer<Game>;

  delete(): void {
    this.io.removeAllListeners();

    delete ioInstance.nsps[`/${this.game}/game/${this.id}`];

    this.onDeleteGame();

    this.deleted = true;
  }

  end(): void {
    this.io.emit(ECommonGameEvent.END);
  }

  getPlayerByLogin(login: string | undefined): TGamePlayer<Game> | undefined {
    return this.players.find((player) => player.login === login);
  }

  initMainGameEntity<Entity extends GameEntity<Game>>(entity: Entity): Entity {
    entity.context = {
      game: this,
    };

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
    player?: string | null,
  ): () => void {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const game = this;

    const playerListener = function (this: IAuthSocket, data: TGameEventData<Game, Event>) {
      const socketPlayer = game.getPlayerByLogin(this.user?.login);

      if (!socketPlayer) {
        return;
      }

      if (player == null || socketPlayer.login === player) {
        listener(data, socketPlayer);
      }
    };

    forEach(this.io.sockets, (socket) => {
      socket.on(event, playerListener);
    });

    (this.temporaryListeners[event] ||= new Set())?.add(playerListener);

    return () => {
      forEach(this.io.sockets, (socket) => {
        socket.off(event, playerListener);
      });

      (this.temporaryListeners[event] ||= new Set())?.delete(playerListener);
    };
  }

  sendBaseGameInfo(): void {
    const updatedData: IGameUpdateEvent = {
      id: this.id,
      players: this.players,
    };

    this.io.emit(ECommonGameEvent.UPDATE, updatedData);
  }

  sendSocketEvent<Event extends TGameEvent<Game>>(event: Event, data: TGameEventData<Game, Event>, socket?: Socket): void {
    const existingEventIndex = this.batchedActions.findIndex((action) => (
      action.event !== event
      || action.socket !== socket
    ));
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
