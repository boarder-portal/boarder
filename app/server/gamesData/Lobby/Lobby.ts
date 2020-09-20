import { Namespace } from 'socket.io';

import { ELobbyEvent } from 'common/types/lobby';
import { IAuthSocket } from 'server/types';
import { EGame, EPlayerStatus } from 'common/types';
import { TGameOptions } from 'common/types/game';

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

      socket.on(ELobbyEvent.CREATE_ROOM, (options: TGameOptions) => {
        this.rooms.push(new Room({ game, options }));

        this.sendLobbyUpdate();
      });

      socket.on(ELobbyEvent.ENTER_ROOM, (roomId: string) => {
        const room = this.rooms.find(({ id }) => id === roomId);
        const { user } = socket;

        if (!room || !user || room.players.length === room.options.playersCount) {
          return;
        }

        const player = room.players.find(({ login }) => login === user.login);

        if (player) {
          return;
        }

        room.players.push({
          ...user,
          status: EPlayerStatus.NOT_READY,
        });

        this.sendLobbyUpdate();
      });
    });
  }

  sendLobbyUpdate() {
    this.io.emit(ELobbyEvent.UPDATE, {
      rooms: this.rooms.map(({ id, players, options }) => ({
        id,
        players,
        options,
      })),
    });
  }
}

export default Lobby;
