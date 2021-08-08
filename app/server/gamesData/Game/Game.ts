import { Namespace } from 'socket.io';
import uuid from 'uuid/v4';
import forEach from 'lodash/forEach';

import { IAuthSocket, IGameEvent } from 'server/types';
import { EPlayerStatus, IPlayer } from 'common/types';
import { EGame, EGameEvent, IGameUpdateEvent, TGameEvent, TGameOptions, TGamePlayer } from 'common/types/game';

import ioSessionMiddleware from 'server/utilities/ioSessionMiddleware';

import ioInstance from 'server/io';

export interface IGameCreateOptions<Game extends EGame> {
  game: Game;
  options: TGameOptions<Game>;
  players: IPlayer[];
  onDeleteGame(): void;
}

abstract class Game<Game extends EGame> {
  io: Namespace;
  game: Game;
  id: string;
  players: TGamePlayer<Game>[];
  options: TGameOptions<Game>;
  onDeleteGame: () => void;

  abstract handlers: Partial<Record<TGameEvent<Game>, (event: IGameEvent<any>) => void>>;

  protected constructor({ game, options, players, onDeleteGame }: IGameCreateOptions<Game>) {
    this.game = game;
    this.id = uuid();
    this.options = options;
    this.players = players.map((player, index) => this.createPlayer(player, index));
    this.io = ioInstance.of(`/${game}/game/${this.id}`);
    this.onDeleteGame = onDeleteGame;

    let deleteGameTimeout: number | null = setTimeout(() => this.deleteGame(), 10000);

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

  getPlayerByLogin(login: string | undefined): TGamePlayer<Game> | undefined {
    return this.players.find((player) => player.login === login);
  }

  sendBaseGameInfo() {
    const updatedData: IGameUpdateEvent = {
      id: this.id,
      players: this.players,
    };

    this.io.emit(EGameEvent.UPDATE, updatedData);
  }

  deleteGame() {
    this.io.removeAllListeners();

    delete ioInstance.nsps[`/${this.game}/game/${this.id}`];

    this.onDeleteGame();
  }

  end() {
    this.io.emit(EGameEvent.END);
  }
}

export default Game;
