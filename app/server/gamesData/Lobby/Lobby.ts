import { Namespace } from 'socket.io';
import uuid from 'uuid/v4';

import { IRoom } from 'common/types/room';
import { ELobbyEvent } from 'common/types/lobby';
import { IAuthSocket } from 'server/types';

import ioSessionMiddleware from 'server/utilities/ioSessionMiddleware';

class Lobby {
  rooms: IRoom[] = [];
  io: Namespace;

  constructor({ io }: { io: Namespace}) {
    this.io = io;

    io.use(ioSessionMiddleware as any);
    io.on('connection', (socket: IAuthSocket) => {
      this.sendLobbyUpdate();

      socket.on(ELobbyEvent.CREATE_ROOM, () => {
        this.rooms.push({
          id: uuid(),
          players: [],
        });

        this.sendLobbyUpdate();
      });

      socket.on(ELobbyEvent.ENTER_ROOM, (roomId: string) => {
        const room = this.rooms.find(({ id }) => id === roomId);

        if (!room || !socket.user) {
          return;
        }

        room.players.push(socket.user);

        this.sendLobbyUpdate();
      });
    });
  }

  sendLobbyUpdate() {
    this.io.emit(ELobbyEvent.UPDATE, {
      rooms: this.rooms,
    });
  }
}

export default Lobby;
