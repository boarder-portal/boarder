import times from 'lodash/times';

import { WIN_SCORE_BY_PLAYER_COUNT } from 'common/constants/games/redSeven';

import { GameType } from 'common/types/game';
import { Card, CardColor, Game, GamePlayerData, GameResult, Player } from 'common/types/games/redSeven';

import { EntityGenerator } from 'common/utilities/Entity/Entity';
import { getCardsScoreValue, isEqualCards } from 'common/utilities/games/redSeven/cards';
import GameEntity from 'server/gamesData/Game/utilities/GameEntity';

import Hand from 'server/gamesData/Game/RedSevenGame/entities/Hand';

export default class RedSevenGame extends GameEntity<GameType.RED_SEVEN> {
  playersData: GamePlayerData[] = this.getPlayersData(() => ({
    scoreCards: [],
  }));
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
    this.winScore = WIN_SCORE_BY_PLAYER_COUNT[this.playersCount] ?? Infinity;

    while (this.nextHandNeeded()) {
      this.hand = new Hand(this, {
        deck: this.deck,
      });

      const { winnerIndex, scoreCards } = yield* this.waitForEntity(this.hand);

      this.playersData[winnerIndex].scoreCards.push(...scoreCards);

      this.deck = this.deck.filter((card) => scoreCards.every((scoreCard) => !isEqualCards(card, scoreCard)));
      this.prevHandsCount++;
    }

    return this.playersData.map(({ scoreCards }) => getCardsScoreValue(scoreCards));
  }

  getGamePlayers(): Player[] {
    return this.getPlayersWithData((playerIndex) => ({
      ...this.playersData[playerIndex],
      hand: this.hand?.playersData[playerIndex] ?? null,
    }));
  }

  nextHandNeeded(): boolean {
    return (
      (this.options.advancedRules || this.prevHandsCount === 0) &&
      this.playersData.every(({ scoreCards }) => getCardsScoreValue(scoreCards) < this.winScore) &&
      this.deck.length >= this.playersCount * 8
    );
  }

  toJSON(): Game {
    return {
      players: this.getGamePlayers(),
      hand: this.hand?.toJSON() ?? null,
    };
  }
}
