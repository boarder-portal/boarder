import { EGame } from 'common/types/game';
import { ICard } from 'common/types/cards';
import { EGameEvent, IPlayer, ITurn, ITurnPlayerData } from 'common/types/hearts';

import GameEntity from 'server/gamesData/Game/utilities/GameEntity';
import { getHighestCardIndex } from 'common/utilities/cards/compareCards';
import isDefined from 'common/utilities/isDefined';

import Root from 'server/gamesData/Game/HeartsGame/entities/Root';
import Hand from 'server/gamesData/Game/HeartsGame/entities/Hand';

export interface ITurnResult {
  highestCardPlayerIndex: number;
  takenCards: ICard[];
}

export default class Turn extends GameEntity<EGame.HEARTS, ITurnResult> {
  root: Root;
  hand: Hand;
  players: IPlayer[];
  playersData: ITurnPlayerData[];
  startPlayerIndex: number;
  activePlayerIndex: number;

  constructor(hand: Hand, startPlayerIndex: number) {
    super();

    this.root = hand.root;
    this.hand = hand;
    this.players = this.root.players;
    this.playersData = this.players.map(() => ({
      playedCard: null,
    }));
    this.activePlayerIndex = this.startPlayerIndex = startPlayerIndex;
  }

  *lifecycle() {
    for (let i = 0; i < this.players.length; i++) {
      const activePlayer = this.players[this.activePlayerIndex];

      const chooseCard = (cardIndex: number): void => {
        this.playersData[this.activePlayerIndex].playedCard = this.hand.takePlayerCard(this.activePlayerIndex, cardIndex);
      };

      const deuceOfClubsIndex = this.hand.getDeuceOfClubsIndex(this.activePlayerIndex);

      if (deuceOfClubsIndex === -1) {
        const { cardIndex } = yield* this.waitForSocketEvent(EGameEvent.CHOOSE_CARD, activePlayer.login);

        chooseCard(cardIndex);
      } else {
        chooseCard(deuceOfClubsIndex);
      }

      this.activePlayerIndex = i === this.players.length - 1
        ? -1
        : (this.activePlayerIndex + 1) % this.players.length;

      this.root.sendInfo();
    }

    const playedCards = this.playersData.map(({ playedCard }) => playedCard);

    if (!playedCards.every(isDefined)) {
      throw new Error('Missing cards');
    }

    yield* this.delay(2000);

    return {
      highestCardPlayerIndex: getHighestCardIndex(playedCards, this.startPlayerIndex),
      takenCards: playedCards,
    };
  }

  toJSON(): ITurn {
    return {
      startPlayerIndex: this.startPlayerIndex,
      activePlayerIndex: this.activePlayerIndex,
      playersData: this.playersData,
    };
  }
}
