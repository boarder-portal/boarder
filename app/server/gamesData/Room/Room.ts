import { Namespace } from 'socket.io';
import uuid from 'uuid/v4';

import { IAuthSocket } from 'server/types';
import { EGame, EPlayerStatus, IPlayer } from 'common/types';
import { ERoomEvent } from 'common/types/room';
import { IPexesoRoomOptions } from 'common/types/pexeso';

import ioSessionMiddleware from 'server/utilities/ioSessionMiddleware';

import ioInstance from 'server/io';
import Game from 'server/gamesData/Game/Game';
import PexesoGame from 'server/gamesData/Game/PexesoGame/PexesoGame';

class Room {
  io: Namespace;
  id: string;
  players: IPlayer[];
  game: Game<IPlayer> | null;
  options: IPexesoRoomOptions;

  constructor({ game, options }: { game: EGame; options: IPexesoRoomOptions }) {
    this.id = uuid();
    this.players = [];
    this.options = options;
    this.io = ioInstance.of(`/${game}/room/${this.id}`);
    this.game = null;

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

        if (this.players.every(({ status }) => status === EPlayerStatus.READY)) {
          if (game === EGame.PEXESO) {
            this.game = new PexesoGame({
              game,
              players: this.players.map((player) => ({
                ...player,
                isActive: false,
                score: 0,
              })),
              options,
            });
          }

          if (!this.game) {
            return;
          }

          this.io.emit(ERoomEvent.START_GAME, this.game.id);
        }
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
