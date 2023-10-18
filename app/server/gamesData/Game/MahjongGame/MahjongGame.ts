import { ALL_WINDS } from 'common/constants/games/mahjong';

import { GameType } from 'common/types/game';
import { Game, GameResult, HandResult, HandsCount, Player, WindSide } from 'common/types/games/mahjong';

import Entity, { EntityGenerator } from 'server/gamesData/Game/utilities/Entity/Entity';
import GameInfo from 'server/gamesData/Game/utilities/Entity/components/GameInfo';
import Server from 'server/gamesData/Game/utilities/Entity/components/Server';

import Round from 'server/gamesData/Game/MahjongGame/entities/Round';

const ROTATED_WINDS = [
  [WindSide.EAST, WindSide.SOUTH, WindSide.WEST, WindSide.NORTH],
  [WindSide.SOUTH, WindSide.EAST, WindSide.NORTH, WindSide.WEST],
  [WindSide.NORTH, WindSide.WEST, WindSide.EAST, WindSide.SOUTH],
  [WindSide.WEST, WindSide.NORTH, WindSide.SOUTH, WindSide.EAST],
];

export default class MahjongGame extends Entity<GameResult> {
  gameInfo = this.obtainComponent(GameInfo<GameType.MAHJONG, this>);
  server = this.obtainComponent(Server<GameType.MAHJONG, this>);

  resultsByHand: HandResult[] = [];

  round: Round | null = null;

  *lifecycle(): EntityGenerator<GameResult> {
    const { handsCount } = this.gameInfo.options;
    const roundsCount = handsCount === HandsCount.ONE ? 1 : 4;
    const handsInRoundCount = handsCount === HandsCount.SIXTEEN ? 4 : 1;

    for (let round = 0; round < roundsCount; round++) {
      this.round = this.spawnEntity(Round, {
        wind: roundsCount === 1 ? null : ALL_WINDS[round],
        handsCount: handsInRoundCount,
        isLastInGame: round === roundsCount - 1,
        playersWinds: ROTATED_WINDS[round],
      });

      this.server.sendGameInfo();

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
    return this.gameInfo.getPlayersWithData((playerIndex) => {
      return {
        round: this.round?.playersData.get(playerIndex) ?? null,
        hand: this.round?.hand?.playersData.get(playerIndex) ?? null,
        turn: this.round?.hand?.turn?.playersData.get(playerIndex) ?? null,
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
