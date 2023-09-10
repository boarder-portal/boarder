import { END_GAME_SCORE } from 'common/constants/games/hearts';
import { PASS_DIRECTIONS } from 'server/gamesData/Game/HeartsGame/constants';

import { GameType } from 'common/types/game';
import { Game, GamePlayerData, GameResult, HandStage, PassDirection, Player } from 'common/types/games/hearts';

import { EntityGenerator } from 'server/gamesData/Game/utilities/Entity';
import GameEntity from 'server/gamesData/Game/utilities/GameEntity';

import Hand from 'server/gamesData/Game/HeartsGame/entities/Hand';

export default class HeartsGame extends GameEntity<GameType.HEARTS> {
  playersData: GamePlayerData[] = this.getPlayersData(() => ({ score: 0 }));
  handIndex = -1;
  passDirection: PassDirection = PassDirection.NONE;

  hand: Hand | null = null;

  *lifecycle(): EntityGenerator<GameResult> {
    while (this.playersData.every(({ score }) => score < END_GAME_SCORE)) {
      this.handIndex++;
      this.passDirection = PASS_DIRECTIONS[this.playersCount][this.handIndex % this.playersCount];

      this.hand = this.spawnEntity(
        new Hand(this, {
          startStage: this.passDirection === PassDirection.NONE ? HandStage.PLAY : HandStage.PASS,
        }),
      );

      this.sendGameInfo();

      const scoreIncrements = yield* this.hand;

      scoreIncrements.forEach((scoreIncrement, playerIndex) => {
        this.playersData[playerIndex].score += scoreIncrement;
      });

      this.sendGameInfo();
    }

    this.hand = null;
  }

  getGamePlayers(): Player[] {
    return this.getPlayersWithData((playerIndex) => ({
      ...this.playersData[playerIndex],
      hand: this.hand?.playersData[playerIndex] ?? null,
      turn: this.hand?.turn?.playersData[playerIndex] ?? null,
    }));
  }

  toJSON(): Game {
    return {
      players: this.getGamePlayers(),
      passDirection: this.passDirection,
      hand: this.hand?.toJSON() ?? null,
    };
  }
}
