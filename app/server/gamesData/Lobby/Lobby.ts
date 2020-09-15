import { Namespace } from 'socket.io';
import uuid from 'uuid/v4';

import { IRoom } from 'common/types/room';
import { ELobbyEvent } from 'common/types/lobby';

class Lobby {
  rooms: IRoom[] = [];
  io: Namespace;

  constructor({ io }: { io: Namespace}) {
    this.io = io;

    io.on('connection', (socket) => {
      io.emit(ELobbyEvent.UPDATE, {
        rooms: this.rooms,
      });

      socket.on(ELobbyEvent.CREATE_ROOM, () => {
        this.rooms.push({
          id: uuid(),
          players: [],
        });

        io.emit(ELobbyEvent.UPDATE, {
          rooms: this.rooms,
        });
      });
    });
  }
}

export default Lobby;
