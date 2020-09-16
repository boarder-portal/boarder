import { Namespace } from 'socket.io';

import { ELobbyEvent } from 'common/types/lobby';
import { IAuthSocket } from 'server/types';
import { EGame, EPlayerStatus } from 'common/types';

import ioSessionMiddleware from 'server/utilities/ioSessionMiddleware';

import Room from 'server/gamesData/Room/Room';
import ioInstance from 'server/io';

class Lobby {
  rooms: Room[] = [];
  io: Namespace;

  constructor({ game }: { game: EGame}) {
    this.io = ioInstance.of(`/${game}/lobby`);

    this.io.use(ioSessionMiddleware as any);
    this.io.on('connection', (socket: IAuthSocket) => {
      this.sendLobbyUpdate();

      socket.on(ELobbyEvent.CREATE_ROOM, () => {
        this.rooms.push(new Room({ game }));

        this.sendLobbyUpdate();
      });

      socket.on(ELobbyEvent.ENTER_ROOM, (roomId: string) => {
        const room = this.rooms.find(({ id }) => id === roomId);

        if (!room || !socket.user) {
          return;
        }

        room.players.push({
          ...socket.user,
          status: EPlayerStatus.NOT_READY,
        });

        this.sendLobbyUpdate();
      });
    });
  }

  sendLobbyUpdate() {
    this.io.emit(ELobbyEvent.UPDATE, {
      rooms: this.rooms.map(({ id, players }) => ({
        id,
        players,
      })),
    });
  }
}

export default Lobby;
