import { GameType } from 'common/types/game';
import { Game, GameResult, Player, PlayerData } from 'common/types/games/redSeven';

import { EntityGenerator } from 'server/gamesData/Game/utilities/Entity';
import GameEntity from 'server/gamesData/Game/utilities/GameEntity';

export default class RedSevenGame extends GameEntity<GameType.RED_SEVEN> {
  playersData: PlayerData[] = this.getPlayersData(() => ({}));

  *lifecycle(): EntityGenerator<GameResult> {}

  getGamePlayers(): Player[] {
    return this.getPlayersWithData((playerIndex) => this.playersData[playerIndex]);
  }

  toJSON(): Game {
    return {
      players: this.getGamePlayers(),
    };
  }
}
