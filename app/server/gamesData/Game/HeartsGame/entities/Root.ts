import { PASS_DIRECTIONS } from 'server/gamesData/Game/HeartsGame/constants';
import { END_GAME_SCORE } from 'common/constants/games/hearts';

import { EGame } from 'common/types/game';
import { EGameEvent, EHandStage, EPassDirection, IGame, IPlayer } from 'common/types/hearts';

import GameEntity from 'server/gamesData/Game/utilities/GameEntity';

import Hand from 'server/gamesData/Game/HeartsGame/entities/Hand';

export default class Root extends GameEntity<EGame.HEARTS> {
  players: IPlayer[];
  handIndex = -1;
  passDirection: EPassDirection = EPassDirection.NONE;
  hand: Hand | null = null;

  constructor(players: IPlayer[]) {
    super();

    this.players = players;
  }

  *lifecycle() {
    while (this.players.every(({ score }) => score < END_GAME_SCORE)) {
      this.handIndex++;
      this.passDirection = PASS_DIRECTIONS[this.players.length][this.handIndex % this.players.length];

      this.hand = this.spawnEntity(
        new Hand(
          this,
          this.passDirection === EPassDirection.NONE ? EHandStage.PLAY : EHandStage.PASS,
        ),
      );

      const scoreIncrements = yield* this.awaitEntity(this.hand);

      scoreIncrements.forEach((scoreIncrement, playerIndex) => {
        this.players[playerIndex].score += scoreIncrement;
      });

      this.sendInfo();
    }

    this.hand = null;
  }

  sendInfo(): void {
    this.sendSocketEvent(EGameEvent.ROOT_INFO, this.toJSON());
  }

  toJSON(): IGame {
    return {
      players: this.players,
      passDirection: this.passDirection,
      hand: this.hand?.toJSON() ?? null,
    };
  }
}
