import { GameType } from 'common/types/game';
import { Card } from 'common/types/game/cards';
import { GameClientEventType, Turn as TurnModel, TurnPlayerData } from 'common/types/games/hearts';

import { EntityGenerator } from 'common/utilities/Entity/Entity';
import { getHighestCardIndex } from 'common/utilities/cards/compareCards';
import { isDefined } from 'common/utilities/is';
import ServerEntity from 'server/gamesData/Game/utilities/ServerEntity';
import TurnController from 'server/gamesData/Game/utilities/TurnController';

import HeartsGame from 'server/gamesData/Game/HeartsGame/HeartsGame';
import Hand from 'server/gamesData/Game/HeartsGame/entities/Hand';

export interface TurnResult {
  highestCardPlayerIndex: number;
  takenCards: Card[];
}

export interface TurnOptions {
  startPlayerIndex: number;
}

export default class Turn extends ServerEntity<GameType.HEARTS, TurnResult> {
  game: HeartsGame;
  hand: Hand;

  playersData: TurnPlayerData[] = this.getPlayersData(() => ({
    playedCard: null,
  }));
  turnController: TurnController<TurnPlayerData>;
  startPlayerIndex: number;

  constructor(hand: Hand, options: TurnOptions) {
    super(hand);

    this.game = hand.game;
    this.hand = hand;
    this.turnController = new TurnController({
      players: this.playersData,
      startPlayerIndex: options.startPlayerIndex,
      isPlayerInPlay: (playerIndex) => !this.playersData[playerIndex].playedCard,
    });
    this.startPlayerIndex = options.startPlayerIndex;
  }

  *lifecycle(): EntityGenerator<TurnResult> {
    while (this.turnController.hasActivePlayer()) {
      let chosenCardIndex = this.hand.getDeuceOfClubsIndex(this.turnController.activePlayerIndex);

      if (chosenCardIndex === -1) {
        chosenCardIndex = yield* this.waitForActivePlayerSocketEvent(GameClientEventType.CHOOSE_CARD, {
          turnController: this.turnController,
        });
      }

      this.turnController.getActivePlayer().playedCard = this.hand.takePlayerCard(
        this.turnController.activePlayerIndex,
        chosenCardIndex,
      );

      this.turnController.passTurn();

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

  toJSON(): TurnModel {
    return {
      startPlayerIndex: this.startPlayerIndex,
      activePlayerIndex: this.turnController.activePlayerIndex,
    };
  }
}
