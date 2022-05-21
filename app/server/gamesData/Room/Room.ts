import { Namespace } from 'socket.io';
import uuid from 'uuid/v4';

import { EPlayerStatus, IGamePlayer } from 'common/types';
import { ERoomEvent, IRoomUpdateEvent } from 'common/types/room';
import { EGame, TGameOptions } from 'common/types/game';

import ioSessionMiddleware from 'server/utilities/ioSessionMiddleware';
import removeNamespace from 'server/utilities/removeNamespace';

import ioInstance from 'server/io';
import Game from 'server/gamesData/Game/Game';

class Room<G extends EGame> {
  io: Namespace;
  id: string;
  players: IGamePlayer[];
  game: Game<G> | null;
  options: TGameOptions<G>;
  deleteRoom: () => void;
  onUpdateRoom: () => void;

  constructor({
    game,
    options,
    onUpdateRoom,
    onDeleteRoom,
  }: {
    game: G;
    options: TGameOptions<G>;
    onUpdateRoom(): void;
    onDeleteRoom: (id: string) => void;
  }) {
    this.id = uuid();
    this.players = [];
    this.options = options;
    this.io = ioInstance.of(`/${game}/room/${this.id}`);
    this.game = null;
    this.onUpdateRoom = onUpdateRoom;

    this.deleteRoom = () => {
      removeNamespace(this.io);

      onDeleteRoom(this.id);
    };

    let deleteRoomTimeout: NodeJS.Timeout | null = setTimeout(() => {
      this.deleteRoom();
    }, 10000);

    this.io.use(ioSessionMiddleware);
    this.io.on('connection', (socket) => {
      const user = socket.user;

      if (!user) {
        return;
      }

      if (deleteRoomTimeout) {
        clearTimeout(deleteRoomTimeout);

        deleteRoomTimeout = null;
      }

      const joinedPlayer = this.players.find(({ login }) => login === user.login);

      if (!joinedPlayer) {
        this.players.push({
          ...user,
          status: EPlayerStatus.NOT_READY,
          index: this.players.length,
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

        if (this.players.every(({ status }) => status === EPlayerStatus.READY)) {
          this.game = new Game({
            game,
            options,
            players: this.players,
            onDeleteGame: this.deleteRoom,
          });

          if (!this.game) {
            return;
          }

          this.io.emit(ERoomEvent.START_GAME, this.game.id);

          this.onUpdateRoom();
        }
      });

      socket.on('disconnect', () => {
        const player = this.players.find(({ login }) => login === user.login);

        if (this.game || !player) {
          return;
        }

        const playerIndex = this.players.findIndex(({ login }) => login === player.login);

        this.players.splice(playerIndex, 1);

        this.sendRoomInfo();

        if (!this.players.length) {
          deleteRoomTimeout = setTimeout(() => {
            this.deleteRoom();
          }, 10000);
        }
      });
    });
  }

  sendRoomInfo(): void {
    this.onUpdateRoom();

    const updatedData: IRoomUpdateEvent<G> = {
      id: this.id,
      players: this.players,
      options: this.options,
    };

    this.io.emit(ERoomEvent.UPDATE, updatedData);
  }
}

export default Room;
