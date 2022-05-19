import { PASS_DIRECTIONS } from 'server/gamesData/Game/HeartsGame/constants';
import { END_GAME_SCORE } from 'common/constants/games/hearts';

import { EGame } from 'common/types/game';
import { EGameEvent, EHandStage, EPassDirection, IGame, IGamePlayerData, IPlayer } from 'common/types/hearts';

import GameEntity from 'server/gamesData/Game/utilities/GameEntity';

import Hand from 'server/gamesData/Game/HeartsGame/entities/Hand';

export default class HeartsGame extends GameEntity<EGame.HEARTS> {
  playersData: IGamePlayerData[] = this.getPlayersData(() => ({ score: 0 }));
  handIndex = -1;
  passDirection: EPassDirection = EPassDirection.NONE;

  hand: Hand | null = null;

  *lifecycle() {
    while (this.playersData.every(({ score }) => score < END_GAME_SCORE)) {
      this.handIndex++;
      this.passDirection = PASS_DIRECTIONS[this.playersCount][this.handIndex % this.players.length];

      this.hand = this.spawnEntity(
        new Hand(this, {
          startStage: this.passDirection === EPassDirection.NONE ? EHandStage.PLAY : EHandStage.PASS,
        }),
      );

      this.sendInfo();

      const scoreIncrements = yield* this.hand;

      scoreIncrements.forEach((scoreIncrement, playerIndex) => {
        this.playersData[playerIndex].score += scoreIncrement;
      });

      this.sendInfo();
    }

    this.hand = null;
  }

  getGamePlayers(): IPlayer[] {
    return this.getPlayersWithData(({ index }) => ({
      ...this.playersData[index],
      hand: this.hand?.playersData[index] ?? null,
      turn: this.hand?.turn?.playersData[index] ?? null,
    }));
  }

  sendInfo(): void {
    this.sendSocketEvent(EGameEvent.GAME_INFO, this.toJSON());
  }

  toJSON(): IGame {
    return {
      players: this.getGamePlayers(),
      passDirection: this.passDirection,
      hand: this.hand?.toJSON() ?? null,
    };
  }
}
