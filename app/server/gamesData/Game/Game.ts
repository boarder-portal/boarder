import { Namespace, Socket } from 'socket.io';
import uuid from 'uuid/v4';
import forEach from 'lodash/forEach';
import shuffle from 'lodash/shuffle';

import { IAuthSocket, IGameEvent } from 'server/types';
import { EPlayerStatus, IPlayer } from 'common/types';
import {
  EGame,
  EGameEvent,
  IGameUpdateEvent,
  TGameEvent,
  TGameEventData,
  TGameEventListener,
  TGameOptions,
  TGamePlayer,
} from 'common/types/game';

import ioSessionMiddleware from 'server/utilities/ioSessionMiddleware';
import GameState from 'server/gamesData/Game/utilities/GameState';

import ioInstance from 'server/io';

export type TEventHandlers<Game extends EGame> = Partial<Record<TGameEvent<Game>, (event: IGameEvent<any>) => void>>;

export type TPlayerEventListeners<Game extends EGame> = {
  [Event in TGameEvent<Game>]?: TPlayerEventListener<Game, Event>;
};

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

abstract class Game<Game extends EGame, RootState = unknown> {
  io: Namespace;
  game: Game;
  id: string;
  players: TGamePlayer<Game>[];
  options: TGameOptions<Game>;
  onDeleteGame: () => void;

  abstract handlers: TEventHandlers<Game>;
  // TODO: make abstract and required
  rootState?: RootState;

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

    let deleteGameTimeout: NodeJS.Timeout | null = setTimeout(() => this.deleteGame(), 10000);

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

      forEach(this.temporaryListeners, (handlers, event) => {
        handlers?.forEach((listener) => {
          socket.on(event, (data) => {
            listener.call(socket, data);
          });
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
          deleteGameTimeout = setTimeout(() => this.deleteGame(), 10000);
        }
      });
    });
  }

  abstract createPlayer(roomPlayer: IPlayer, index: number): TGamePlayer<Game>;

  listen<Event extends TGameEvent<Game>>(
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

  send<Event extends TGameEvent<Game>>(event: Event, data: TGameEventData<Game, Event>, socket?: Socket): void {
    // TODO: batch actions, don't send same actions multiple times

    (socket ?? this.io).emit(event, data);
  }

  getPlayerByLogin(login: string | undefined): TGamePlayer<Game> | undefined {
    return this.players.find((player) => player.login === login);
  }

  sendBaseGameInfo(): void {
    const updatedData: IGameUpdateEvent = {
      id: this.id,
      players: this.players,
    };

    this.io.emit(EGameEvent.UPDATE, updatedData);
  }

  initMainGameState(state: GameState<Game, RootState, void>): RootState {
    state.context = {
      listen: (events, player) => {
        const unsubscribers = new Set<() => void>();

        forEach(events, (handler, event) => {
          if (handler) {
            unsubscribers.add(this.listen(event as TGameEvent<Game>, handler, player));
          }
        });

        return () => {
          for (const unsubscribe of unsubscribers) {
            unsubscribe();
          }
        };
      },
      send: <Event extends TGameEvent<Game>>(event: Event, data: TGameEventData<Game, Event>, socket?: Socket) => {
        this.send(event, data, socket);
      },
    };

    (async () => {
      await state.lifecycle();

      this.end();
    })().catch((err) => {
      console.log(err);

      this.deleteGame();
    });

    return state.getRootState();
  }

  deleteGame(): void {
    this.io.removeAllListeners();

    delete ioInstance.nsps[`/${this.game}/game/${this.id}`];

    this.onDeleteGame();
  }

  end(): void {
    this.io.emit(EGameEvent.END);
  }
}

export default Game;
