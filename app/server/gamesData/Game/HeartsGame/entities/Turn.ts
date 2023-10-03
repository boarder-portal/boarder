import { GameType } from 'common/types/game';
import { Card } from 'common/types/game/cards';
import { GameClientEventType, Turn as TurnModel, TurnPlayerData } from 'common/types/games/hearts';

import { getHighestCardIndex } from 'common/utilities/cards/compareCards';
import { isDefined } from 'common/utilities/is';
import { EntityGenerator } from 'server/gamesData/Game/utilities/Entity';
import TurnEntity from 'server/gamesData/Game/utilities/TurnEntity';

import HeartsGame from 'server/gamesData/Game/HeartsGame/HeartsGame';
import Hand from 'server/gamesData/Game/HeartsGame/entities/Hand';

export interface TurnResult {
  highestCardPlayerIndex: number;
  takenCards: Card[];
}

export interface TurnOptions {
  startPlayerIndex: number;
}

export default class Turn extends TurnEntity<GameType.HEARTS, TurnResult> {
  game: HeartsGame;
  hand: Hand;

  playersData: TurnPlayerData[];
  startPlayerIndex: number;

  constructor(hand: Hand, options: TurnOptions) {
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

  *lifecycle(): EntityGenerator<TurnResult> {
    while (this.hasActivePlayer()) {
      let chosenCardIndex = this.hand.getDeuceOfClubsIndex(this.activePlayerIndex);

      if (chosenCardIndex === -1) {
        chosenCardIndex = yield* this.waitForPlayerSocketEvent(GameClientEventType.CHOOSE_CARD, {
          playerIndex: this.activePlayerIndex,
        });
      }

      this.playersData[this.activePlayerIndex].playedCard = this.hand.takePlayerCard(
        this.activePlayerIndex,
        chosenCardIndex,
      );

      this.passTurn();

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

  isPlayerInPlay(playerIndex: number): boolean {
    return !this.playersData[playerIndex].playedCard;
  }

  toJSON(): TurnModel {
    return {
      startPlayerIndex: this.startPlayerIndex,
      activePlayerIndex: this.activePlayerIndex,
    };
  }
}
