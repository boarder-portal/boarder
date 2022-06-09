import { EGame } from 'common/types/game';
import { ICard } from 'common/types/cards';
import { EGameClientEvent, ITurn, ITurnPlayerData } from 'common/types/hearts';

import { TGenerator } from 'server/gamesData/Game/utilities/Entity';
import TurnEntity from 'server/gamesData/Game/utilities/TurnEntity';
import { getHighestCardIndex } from 'common/utilities/cards/compareCards';
import isDefined from 'common/utilities/isDefined';

import HeartsGame from 'server/gamesData/Game/HeartsGame/HeartsGame';
import Hand from 'server/gamesData/Game/HeartsGame/entities/Hand';

export interface ITurnResult {
  highestCardPlayerIndex: number;
  takenCards: ICard[];
}

export interface ITurnOptions {
  startPlayerIndex: number;
}

export default class Turn extends TurnEntity<EGame.HEARTS, ITurnResult> {
  game: HeartsGame;
  hand: Hand;

  playersData: ITurnPlayerData[];
  startPlayerIndex: number;

  constructor(hand: Hand, options: ITurnOptions) {
    super(hand, {
      activePlayerIndex: options.startPlayerIndex,
    });

    this.game = hand.game;
    this.hand = hand;
    this.playersData = this.getPlayersData(() => ({
      playedCard: null,
    }));
    this.startPlayerIndex = options.startPlayerIndex;
  }

  *lifecycle(): TGenerator<ITurnResult> {
    for (let i = 0; i < this.playersCount; i++) {
      let chosenCardIndex = this.hand.getDeuceOfClubsIndex(this.activePlayerIndex);

      if (chosenCardIndex === -1) {
        chosenCardIndex = yield* this.waitForPlayerSocketEvent(EGameClientEvent.CHOOSE_CARD, {
          playerIndex: this.activePlayerIndex,
        });
      }

      this.playersData[this.activePlayerIndex].playedCard = this.hand.takePlayerCard(
        this.activePlayerIndex,
        chosenCardIndex,
      );

      this.activePlayerIndex = i === this.playersCount - 1 ? -1 : this.getNextPlayerIndex();

      this.game.sendGameInfo();
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
