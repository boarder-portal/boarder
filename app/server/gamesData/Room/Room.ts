import { Namespace } from 'socket.io';
import uuid from 'uuid/v4';

import { EPlayerStatus, IGamePlayer } from 'common/types';
import { ERoomEvent, IRoomUpdateEvent } from 'common/types/room';
import { EGame, TGameOptions } from 'common/types/game';

import ioSessionMiddleware from 'server/utilities/ioSessionMiddleware';
import removeNamespace from 'server/utilities/removeNamespace';

import ioInstance from 'server/io';
import Game, { IGameCreateOptions } from 'server/gamesData/Game/Game';
import PexesoGame from 'server/gamesData/Game/PexesoGame/PexesoGame';
import MazeGame from 'server/gamesData/Game/MazeGame/MazeGame';
import OnitamaGame from 'server/gamesData/Game/OnitamaGame/OnitamaGame';
import SetGame from 'server/gamesData/Game/SetGame/SetGame';
import SurvivalOnlineGame from 'server/gamesData/Game/SurvivalOnlineGame/SurvivalOnlineGame';
import CarcassonneGame from 'server/gamesData/Game/CarcassonneGame/CarcassonneGame';
import SevenWondersGame from 'server/gamesData/Game/SevenWondersGame/SevenWondersGame';
import HeartsGame from 'server/gamesData/Game/HeartsGame/HeartsGame';

const GAMES_MAP: {
  [G in EGame]: { new (options: IGameCreateOptions<G>): Game<G> };
} = {
  [EGame.PEXESO]: PexesoGame,
  [EGame.SURVIVAL_ONLINE]: SurvivalOnlineGame,
  [EGame.MAZE]: MazeGame,
  [EGame.SET]: SetGame,
  [EGame.ONITAMA]: OnitamaGame,
  [EGame.CARCASSONNE]: CarcassonneGame,
  [EGame.SEVEN_WONDERS]: SevenWondersGame,
  [EGame.HEARTS]: HeartsGame,
};

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
          if (game in GAMES_MAP) {
            this.game = new (GAMES_MAP[game] as any)({
              game,
              options,
              players: this.players,
              onDeleteGame: this.deleteRoom,
            });
          }

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
