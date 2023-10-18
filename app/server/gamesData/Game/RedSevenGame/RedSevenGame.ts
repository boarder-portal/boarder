import times from 'lodash/times';

import { WIN_SCORE_BY_PLAYER_COUNT } from 'common/constants/games/redSeven';

import { GameType } from 'common/types/game';
import { Card, CardColor, Game, GamePlayerData, GameResult, Player } from 'common/types/games/redSeven';

import { getCardsScoreValue, isEqualCards } from 'common/utilities/games/redSeven/cards';
import Entity, { EntityGenerator } from 'server/gamesData/Game/utilities/Entity/Entity';
import GameInfo from 'server/gamesData/Game/utilities/Entity/components/GameInfo';

import Hand from 'server/gamesData/Game/RedSevenGame/entities/Hand';

export default class RedSevenGame extends Entity<GameResult> {
  gameInfo = this.obtainComponent(GameInfo<GameType.RED_SEVEN, this>);

  playersData = this.gameInfo.createPlayersData<GamePlayerData>({
    init: () => ({
      scoreCards: [],
    }),
  });
  deck: Card[] = [];
  winScore = Infinity;
  prevHandsCount = 0;

  hand: Hand | null = null;

  *lifecycle(): EntityGenerator<GameResult> {
    this.deck = times(7, (index) =>
      Object.values(CardColor).map((color) => ({
        value: index + 1,
        color,
      })),
    ).flat();
    this.winScore = WIN_SCORE_BY_PLAYER_COUNT[this.gameInfo.playersCount] ?? Infinity;

    while (this.nextHandNeeded()) {
      this.hand = this.spawnEntity(Hand, {
        deck: this.deck,
      });

      const { winnerIndex, scoreCards } = yield* this.waitForEntity(this.hand);

      this.playersData.get(winnerIndex).scoreCards.push(...scoreCards);

      this.deck = this.deck.filter((card) => scoreCards.every((scoreCard) => !isEqualCards(card, scoreCard)));
      this.prevHandsCount++;
    }

    return this.playersData.map(({ scoreCards }) => getCardsScoreValue(scoreCards));
  }

  getGamePlayers(): Player[] {
    return this.gameInfo.getPlayersWithData((playerIndex) => ({
      ...this.playersData.get(playerIndex),
      hand: this.hand?.playersData.get(playerIndex) ?? null,
    }));
  }

  nextHandNeeded(): boolean {
    return (
      (this.gameInfo.options.advancedRules || this.prevHandsCount === 0) &&
      this.playersData.every(({ scoreCards }) => getCardsScoreValue(scoreCards) < this.winScore) &&
      this.deck.length >= this.gameInfo.playersCount * 8
    );
  }

  toJSON(): Game {
    return {
      players: this.getGamePlayers(),
      hand: this.hand?.toJSON() ?? null,
    };
  }
}
