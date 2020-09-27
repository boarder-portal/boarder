import { Namespace } from 'socket.io';
import uuid from 'uuid/v4';

import { IAuthSocket, IGameEvent } from 'server/types';
import { EGame, EPlayerStatus, IPlayer, TGamePlayer } from 'common/types';
import { EGameEvent, TGameEvent, TGameOptions } from 'common/types/game';

import ioSessionMiddleware from 'server/utilities/ioSessionMiddleware';

import ioInstance from 'server/io';

export interface IGameCreateOptions<Game extends EGame> {
  game: Game;
  options: TGameOptions<Game>;
}

abstract class Game<G extends EGame> {
  io: Namespace;
  id: string;
  players: TGamePlayer<G>[] = [];
  options: TGameOptions<G>;

  abstract handlers: Partial<Record<TGameEvent<G>, (event: IGameEvent<any>) => void>>;

  protected constructor({ game, options }: IGameCreateOptions<G>) {
    this.id = uuid();
    this.options = options;
    this.io = ioInstance.of(`/${game}/game/${this.id}`);

    this.io.use(ioSessionMiddleware as any);
    this.io.on('connection', (socket: IAuthSocket) => {
      const user = socket.user;

      if (user) {
        const player = this.players.find(({ login }) => login === user.login);

        if (player) {
          player.status = EPlayerStatus.PLAYING;
        }
      }

      this.sendBaseGameInfo();

      socket.on(EGameEvent.GAME_EVENT, (event: any, data: any) => {
        // @ts-ignore
        this.handlers[event].call(this, {
          data,
          socket,
        });
      });
    });
  }

  abstract createPlayer(roomPlayer: IPlayer): TGamePlayer<G>;

  sendBaseGameInfo() {
    this.io.emit(EGameEvent.UPDATE, {
      id: this.id,
      players: this.players,
    });
  }
}

export default Game;
