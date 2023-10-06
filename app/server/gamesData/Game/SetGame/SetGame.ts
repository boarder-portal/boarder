import shuffle from 'lodash/shuffle';
import times from 'lodash/times';

import {
  NEW_CARDS_COUNT,
  NO_SET_POINTS,
  SET_POINTS,
  START_CARDS_COUNT,
  WRONG_NO_SET_POINTS,
  WRONG_SET_POINTS,
} from 'common/constants/games/set';

import { GameType } from 'common/types/game';
import {
  Card,
  CardColor,
  CardFill,
  CardShape,
  Game,
  GameClientEventType,
  GameResult,
  Player,
  PlayerData,
} from 'common/types/games/set';

import { EntityGenerator } from 'common/utilities/Entity';
import { findSet, isSet } from 'common/utilities/games/set/set';
import { isDefined } from 'common/utilities/is';
import GameEntity from 'server/gamesData/Game/utilities/GameEntity';

export default class SetGame extends GameEntity<GameType.SET> {
  playersData: PlayerData[] = this.getPlayersData(() => ({
    score: 0,
  }));
  cards: Card[] = [];
  deck: Card[] = [];

  *lifecycle(): EntityGenerator<GameResult> {
    const notShuffledCardsStack: Card[] = [];

    Object.values(CardColor).forEach((color) => {
      Object.values(CardShape).forEach((shape) => {
        Object.values(CardFill).forEach((fill) => {
          times(3).forEach((countIndex) => {
            notShuffledCardsStack.push({
              color,
              count: countIndex + 1,
              shape,
              fill,
            });
          });
        });
      });
    });

    this.deck = shuffle(notShuffledCardsStack);
    this.cards = this.deck.splice(-START_CARDS_COUNT);

    while (true) {
      if (!findSet(this.cards) && this.deck.length === 0) {
        break;
      }

      const { event, data, playerIndex } = yield* this.waitForSocketEvents([
        GameClientEventType.SEND_SET,
        GameClientEventType.SEND_NO_SET,
      ]);

      const playerData = this.playersData[playerIndex];

      if (event === GameClientEventType.SEND_SET) {
        const { cardsIndexes } = data;

        const cards = cardsIndexes.map((cardIndex) => this.cards.at(cardIndex)).filter(isDefined);

        if (isSet(cards)) {
          const needToDraw = this.cards.length === START_CARDS_COUNT;

          playerData.score += SET_POINTS;

          this.cards = this.cards
            .map((card, cardIndex) => (cardsIndexes.includes(cardIndex) ? (needToDraw ? this.drawCard() : null) : card))
            .filter(isDefined);
        } else {
          playerData.score += WRONG_SET_POINTS;
        }

        this.sendGameInfo();
      } else if (findSet(this.cards)) {
        playerData.score += WRONG_NO_SET_POINTS;
      } else {
        playerData.score += NO_SET_POINTS;

        times(NEW_CARDS_COUNT, () => {
          const newCard = this.drawCard();

          if (newCard) {
            this.cards.push(newCard);
          }
        });
      }

      this.sendGameInfo();
    }

    return this.playersData.map(({ score }) => score);
  }

  drawCard(): Card | undefined {
    return this.deck.pop();
  }

  getGamePlayers(): Player[] {
    return this.getPlayersWithData((playerIndex) => this.playersData[playerIndex]);
  }

  toJSON(): Game {
    return {
      players: this.getGamePlayers(),
      cards: this.cards,
    };
  }
}
