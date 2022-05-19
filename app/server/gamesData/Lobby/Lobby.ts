import { Namespace } from 'socket.io';

import { ELobbyEvent, ILobbyUpdateEvent } from 'common/types/lobby';
import { EPlayerStatus } from 'common/types';
import { EGame, TGameOptions } from 'common/types/game';

import ioSessionMiddleware from 'server/utilities/ioSessionMiddleware';

import Room from 'server/gamesData/Room/Room';
import ioInstance from 'server/io';

class Lobby<Game extends EGame> {
  rooms: Room<Game>[] = [];
  io: Namespace;
  game: Game;

  constructor({ game }: { game: Game }) {
    this.io = ioInstance.of(`/${game}/lobby`);
    this.game = game;

    this.io.use(ioSessionMiddleware);
    this.io.on('connection', (socket) => {
      this.sendLobbyUpdate();

      socket.on(ELobbyEvent.CREATE_ROOM, (options: TGameOptions<Game>) => {
        this.rooms.push(
          new Room({
            game,
            options,
            onUpdateRoom: this.sendLobbyUpdate,
            onDeleteRoom: this.deleteRoom,
          }),
        );

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
          index: room.players.length,
        });

        this.sendLobbyUpdate();
      });
    });
  }

  sendLobbyUpdate = (): void => {
    const updatedData: ILobbyUpdateEvent<Game> = {
      rooms: this.rooms.map(({ id, players, options, game }) => ({
        id,
        players,
        gameIsStarted: Boolean(game),
        options,
      })),
    };

    this.io.emit(ELobbyEvent.UPDATE, updatedData);
  };

  deleteRoom = (id: string): void => {
    const roomIndex = this.rooms.findIndex(({ id: roomId }) => roomId === id);

    if (roomIndex === -1) {
      return;
    }

    this.rooms = [...this.rooms.slice(0, roomIndex), ...this.rooms.slice(roomIndex + 1)];

    this.sendLobbyUpdate();
  };
}

export default Lobby;
