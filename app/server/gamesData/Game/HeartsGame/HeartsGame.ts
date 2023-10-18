import { END_GAME_SCORE } from 'common/constants/games/hearts';
import { PASS_DIRECTIONS } from 'server/gamesData/Game/HeartsGame/constants';

import { GameType } from 'common/types/game';
import { Game, GamePlayerData, GameResult, HandStage, PassDirection, Player } from 'common/types/games/hearts';

import Entity, { EntityGenerator } from 'server/gamesData/Game/utilities/Entity/Entity';
import GameInfo from 'server/gamesData/Game/utilities/Entity/components/GameInfo';
import Server from 'server/gamesData/Game/utilities/Entity/components/Server';

import Hand from 'server/gamesData/Game/HeartsGame/entities/Hand';

export default class HeartsGame extends Entity<GameResult> {
  gameInfo = this.obtainComponent(GameInfo<GameType.HEARTS, this>);
  server = this.obtainComponent(Server<GameType.HEARTS, this>);

  playersData = this.gameInfo.createPlayersData<GamePlayerData>({
    init: () => ({
      score: 0,
    }),
  });
  handIndex = -1;
  passDirection: PassDirection = PassDirection.NONE;

  hand: Hand | null = null;

  *lifecycle(): EntityGenerator<GameResult> {
    while (this.playersData.every(({ score }) => score < END_GAME_SCORE)) {
      this.handIndex++;

      this.passDirection = PASS_DIRECTIONS[this.gameInfo.playersCount][this.handIndex % this.gameInfo.playersCount];

      this.hand = this.spawnEntity(Hand, {
        startStage: this.passDirection === PassDirection.NONE ? HandStage.PLAY : HandStage.PASS,
      });

      this.server.sendGameInfo();

      const scoreIncrements = yield* this.waitForEntity(this.hand);

      scoreIncrements.forEach((scoreIncrement, playerIndex) => {
        this.playersData.get(playerIndex).score += scoreIncrement;
      });

      this.server.sendGameInfo();
    }

    this.hand = null;
  }

  getGamePlayers(): Player[] {
    return this.gameInfo.getPlayersWithData((playerIndex) => ({
      ...this.playersData.get(playerIndex),
      hand: this.hand?.playersData.get(playerIndex) ?? null,
      turn: this.hand?.turn?.playersData.get(playerIndex) ?? null,
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
