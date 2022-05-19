import { EGame } from 'common/types/game';
import { ICard } from 'common/types/cards';
import { EGameEvent, ITurn, ITurnPlayerData } from 'common/types/hearts';

import GameEntity from 'server/gamesData/Game/utilities/GameEntity';
import { getHighestCardIndex } from 'common/utilities/cards/compareCards';
import isDefined from 'common/utilities/isDefined';

import HeartsGame from 'server/gamesData/Game/HeartsGame/entities/HeartsGame';
import Hand from 'server/gamesData/Game/HeartsGame/entities/Hand';

export interface ITurnResult {
  highestCardPlayerIndex: number;
  takenCards: ICard[];
}

export interface ITurnOptions {
  startPlayerIndex: number;
}

export default class Turn extends GameEntity<EGame.HEARTS, ITurnResult> {
  game: HeartsGame;
  hand: Hand;

  playersData: ITurnPlayerData[];
  startPlayerIndex: number;
  activePlayerIndex: number;

  constructor(hand: Hand, options: ITurnOptions) {
    super(hand);

    this.game = hand.game;
    this.hand = hand;
    this.playersData = this.getPlayersData(() => ({
      playedCard: null,
    }));
    this.activePlayerIndex = this.startPlayerIndex = options.startPlayerIndex;
  }

  *lifecycle() {
    for (let i = 0; i < this.playersCount; i++) {
      let chosenCardIndex = this.hand.getDeuceOfClubsIndex(this.activePlayerIndex);

      if (chosenCardIndex === -1) {
        chosenCardIndex = yield* this.waitForPlayerSocketEvent(EGameEvent.CHOOSE_CARD, {
          playerIndex: this.activePlayerIndex,
        });
      }

      this.playersData[this.activePlayerIndex].playedCard = this.hand.takePlayerCard(
        this.activePlayerIndex,
        chosenCardIndex,
      );

      this.activePlayerIndex = i === this.playersCount - 1 ? -1 : (this.activePlayerIndex + 1) % this.playersCount;

      this.game.sendInfo();
    }

    const playedCards = this.playersData.map(({ playedCard }) => playedCard);

    if (!playedCards.every(isDefined)) {
      throw new Error('Missing cards');
    }

    return {
      highestCardPlayerIndex: getHighestCardIndex(playedCards, this.startPlayerIndex),
      takenCards: playedCards,
    };
  }

  toJSON(): ITurn {
    return {
      startPlayerIndex: this.startPlayerIndex,
      activePlayerIndex: this.activePlayerIndex,
    };
  }
}
