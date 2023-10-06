import { ALL_WINDS } from 'common/constants/games/mahjong';

import { GameType } from 'common/types/game';
import { Game, GamePlayerData, GameResult, HandResult, HandsCount, Player, WindSide } from 'common/types/games/mahjong';

import { EntityGenerator } from 'common/utilities/Entity/Entity';
import GameEntity from 'server/gamesData/Game/utilities/GameEntity';

import Round from 'server/gamesData/Game/MahjongGame/entities/Round';

const ROTATED_WINDS = [
  [WindSide.EAST, WindSide.SOUTH, WindSide.WEST, WindSide.NORTH],
  [WindSide.SOUTH, WindSide.EAST, WindSide.NORTH, WindSide.WEST],
  [WindSide.NORTH, WindSide.WEST, WindSide.EAST, WindSide.SOUTH],
  [WindSide.WEST, WindSide.NORTH, WindSide.SOUTH, WindSide.EAST],
];

export default class MahjongGame extends GameEntity<GameType.MAHJONG> {
  playersData: GamePlayerData[] = this.getPlayersData(() => ({}));
  resultsByHand: HandResult[] = [];

  round: Round | null = null;

  *lifecycle(): EntityGenerator<GameResult> {
    const { handsCount } = this.options;
    const roundsCount = handsCount === HandsCount.ONE ? 1 : 4;
    const handsInRoundCount = handsCount === HandsCount.SIXTEEN ? 4 : 1;

    for (let round = 0; round < roundsCount; round++) {
      this.round = new Round(this, {
        wind: roundsCount === 1 ? null : ALL_WINDS[round],
        handsCount: handsInRoundCount,
        isLastInGame: round === roundsCount - 1,
        playersWinds: ROTATED_WINDS[round],
      });

      this.sendGameInfo();

      yield* this.waitForEntity(this.round);

      if (round !== roundsCount - 1) {
        this.round = null;
      }
    }
  }

  addHandResult(result: HandResult): void {
    this.resultsByHand.push(result);
  }

  getGamePlayers(): Player[] {
    return this.getPlayersWithData((playerIndex) => {
      return {
        ...this.playersData[playerIndex],
        round: this.round?.playersData[playerIndex] ?? null,
        hand: this.round?.hand?.playersData[playerIndex] ?? null,
        turn: this.round?.hand?.turn?.playersData[playerIndex] ?? null,
      };
    });
  }

  toJSON(): Game {
    return {
      players: this.getGamePlayers(),
      resultsByHand: this.resultsByHand,
      round: this.round?.toJSON() ?? null,
    };
  }
}
