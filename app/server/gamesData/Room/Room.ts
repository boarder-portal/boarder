import { Namespace } from 'socket.io';
import uuid from 'uuid/v4';

import { IAuthSocket } from 'server/types';
import { EGame, EPlayerStatus, IGameParams, IPlayer } from 'common/types';
import { ERoomEvent, IRoom } from 'common/types/room';
import { TGameOptions } from 'common/types/game';

import ioSessionMiddleware from 'server/utilities/ioSessionMiddleware';

import ioInstance from 'server/io';
import Game, { IGameCreateOptions } from 'server/gamesData/Game/Game';
import PexesoGame from 'server/gamesData/Game/PexesoGame/PexesoGame';
import SurvivalOnlineGame from 'server/gamesData/Game/SurvivalOnlineGame/SurvivalOnlineGame';

const GAMES_MAP = {
  [EGame.PEXESO]: PexesoGame,
  [EGame.SURVIVAL_ONLINE]: SurvivalOnlineGame,
};

class Room<G extends EGame> implements IRoom<G> {
  io: Namespace;
  id: string;
  players: IPlayer[];
  game: Game<G> | null;
  options: TGameOptions<G>;

  constructor({ game, options }: { game: G; options: IGameParams[G]['options'] }) {
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
          if (game in GAMES_MAP) {
            this.game = new (GAMES_MAP[game] as { new (options: IGameCreateOptions<G>): Game<G> })({
              game,
              options,
              players: this.players,
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
      options: this.options,
    });
  }
}

export default Room;
