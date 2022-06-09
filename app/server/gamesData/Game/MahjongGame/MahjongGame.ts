import { EGame } from 'common/types/game';
import { IGame, IPlayer, IPlayerData } from 'common/types/mahjong';

import GameEntity from 'server/gamesData/Game/utilities/GameEntity';
import { TGenerator } from 'server/gamesData/Game/utilities/Entity';

export default class MahjongGame extends GameEntity<EGame.MAHJONG> {
  playersData: IPlayerData[] = this.getPlayersData(() => ({}));

  *lifecycle(): TGenerator {}

  getGamePlayers(): IPlayer[] {
    return this.getPlayersWithData((playerIndex) => this.playersData[playerIndex]);
  }

  toJSON(): IGame {
    return {
      players: this.getGamePlayers(),
    };
  }
}
