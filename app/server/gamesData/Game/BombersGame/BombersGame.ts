import { EGame } from 'common/types/game';
import { IGame, IPlayer, IPlayerData } from 'common/types/bombers';

import GameEntity from 'server/gamesData/Game/utilities/GameEntity';
import { TGenerator } from 'server/gamesData/Game/utilities/Entity';

export default class BombersGame extends GameEntity<EGame.BOMBERS> {
  playersData: IPlayerData[] = this.getPlayersWithData(() => ({}));

  *lifecycle(): TGenerator {}

  getGamePlayers(): IPlayer[] {
    return this.getPlayersWithData((playerIndex) => ({
      ...this.playersData[playerIndex],
    }));
  }

  toJSON(): IGame {
    return {
      players: this.getGamePlayers(),
    };
  }
}
