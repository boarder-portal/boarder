import { Namespace } from 'socket.io';
import uuid from 'uuid/v4';

import { IAuthSocket } from 'server/types';
import { EGame, EPlayerStatus, IPlayer } from 'common/types';
import { EGameEvent } from 'common/types/game';

import ioSessionMiddleware from 'server/utilities/ioSessionMiddleware';

import ioInstance from 'server/io';

class Game<Player extends IPlayer> {
  io: Namespace;
  id: string;
  players: Player[];

  constructor({ game, players }: { game: EGame; players: Player[] }) {
    this.id = uuid();
    this.players = players;
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

  sendBaseGameInfo() {
    this.io.emit(EGameEvent.UPDATE, {
      id: this.id,
      players: this.players,
    });
  }
}

export default Game;
