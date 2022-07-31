import { ALL_WINDS } from 'common/constants/games/mahjong';

import { EGame } from 'common/types/game';
import { EHandsCount, IGame, IGamePlayerData, IPlayer } from 'common/types/mahjong';

import GameEntity from 'server/gamesData/Game/utilities/GameEntity';
import { TGenerator } from 'server/gamesData/Game/utilities/Entity';

import Round from 'server/gamesData/Game/MahjongGame/entities/Round';

export default class MahjongGame extends GameEntity<EGame.MAHJONG> {
  playersData: IGamePlayerData[] = this.getPlayersData(() => ({}));
  scoresByHand: number[][] = [];

  round: Round | null = null;

  *lifecycle(): TGenerator {
    const roundsCount = this.options.handsCount === EHandsCount.ONE ? 1 : 4;
    const handsInRoundCount = this.options.handsCount === EHandsCount.SIXTEEN ? 4 : 1;

    for (let round = 0; round < roundsCount; round++) {
      this.round = this.spawnEntity(
        new Round(this, {
          wind: roundsCount === 1 ? null : ALL_WINDS[round],
          handsCount: handsInRoundCount,
          isLastInGame: round === roundsCount - 1,
          // TODO: rotate winds
          playersWinds: ALL_WINDS,
        }),
      );

      this.sendGameInfo();

      yield* this.round;
    }
  }

  addHandResult(result: number[]): void {
    this.scoresByHand.push(result);
  }

  getGamePlayers(): IPlayer[] {
    return this.getPlayersWithData((playerIndex) => {
      return {
        ...this.playersData[playerIndex],
        round: this.round?.playersData[playerIndex] ?? null,
        hand: this.round?.hand?.playersData[playerIndex] ?? null,
        turn: this.round?.hand?.turn?.playersData[playerIndex] ?? null,
      };
    });
  }

  toJSON(): IGame {
    return {
      players: this.getGamePlayers(),
      scoresByHand: this.scoresByHand,
      round: this.round?.toJSON() ?? null,
    };
  }
}
