import { Namespace } from 'socket.io';
import uuid from 'uuid/v4';

import { IAuthSocket } from 'server/types';
import { EGame, EPlayerStatus, IPlayer } from 'common/types';
import { ERoomEvent } from 'common/types/room';

import ioSessionMiddleware from 'server/utilities/ioSessionMiddleware';

import ioInstance from 'server/io';

class Room {
  io: Namespace;
  id: string;
  players: IPlayer[];

  constructor({ game }: { game: EGame }) {
    this.id = uuid();
    this.players = [];
    this.io = ioInstance.of(`/${game}/room/${this.id}`);

    this.io.use(ioSessionMiddleware as any);
    this.io.on('connection', (socket: IAuthSocket) => {
      const user = socket.user;

      if (!user) {
        return;
      }

      const joinedPlayer = this.players.find(({ login }) => login === user.login);

      if (!joinedPlayer) {
        this.players.push({
          ...user,
          status: EPlayerStatus.NOT_READY,
        });
      }

      this.sendRoomInfo();

      socket.on(ERoomEvent.TOGGLE_USER_STATE, () => {
        const player = this.players.find(({ login }) => login === user.login);

        if (!player) {
          return;
        }

        player.status = player.status === EPlayerStatus.READY ? EPlayerStatus.NOT_READY : EPlayerStatus.READY;

        this.sendRoomInfo();
      });
    });
  }

  sendRoomInfo() {
    this.io.emit(ERoomEvent.UPDATE, {
      id: this.id,
      players: this.players,
    });
  }
}

export default Room;
