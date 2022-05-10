import { EGame } from 'common/types/game';
import { ICard } from 'common/types/cards';
import { EGameEvent, IPlayer, ITurn, ITurnPlayerData } from 'common/types/hearts';

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

const SHOW_CARDS_TIMEOUT = 2 * 1000;

export default class Turn extends GameEntity<EGame.HEARTS, ITurnResult> {
  game: HeartsGame;
  hand: Hand;
  players: IPlayer[];
  playersData: ITurnPlayerData[];
  startPlayerIndex: number;
  activePlayerIndex: number;

  constructor(hand: Hand, options: ITurnOptions) {
    super();

    this.game = hand.game;
    this.hand = hand;
    this.players = this.game.players;
    this.playersData = this.players.map(() => ({
      playedCard: null,
    }));
    this.activePlayerIndex = this.startPlayerIndex = options.startPlayerIndex;
  }

  async lifecycle() {
    for (let i = 0; i < this.players.length; i++) {
      const activePlayer = this.players[this.activePlayerIndex];

      let chosenCardIndex = this.hand.getDeuceOfClubsIndex(this.activePlayerIndex);

      if (chosenCardIndex === -1) {
        const { cardIndex } = await this.waitForSocketEvent(EGameEvent.CHOOSE_CARD, activePlayer.login);

        chosenCardIndex = cardIndex;
      }

      this.playersData[this.activePlayerIndex].playedCard = this.hand.takePlayerCard(this.activePlayerIndex, chosenCardIndex);

      this.activePlayerIndex = i === this.players.length - 1
        ? -1
        : (this.activePlayerIndex + 1) % this.players.length;

      this.game.sendInfo();
    }

    const playedCards = this.playersData.map(({ playedCard }) => playedCard);

    if (!playedCards.every(isDefined)) {
      throw new Error('Missing cards');
    }

    await this.delay(SHOW_CARDS_TIMEOUT);

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
