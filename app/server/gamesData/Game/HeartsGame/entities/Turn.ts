import { GameType } from 'common/types/game';
import { Card } from 'common/types/game/cards';
import { GameClientEventType, Turn as TurnModel, TurnPlayerData } from 'common/types/games/hearts';

import { getHighestCardIndex } from 'common/utilities/cards/compareCards';
import { isDefined } from 'common/utilities/is';
import Entity, { EntityGenerator } from 'server/gamesData/Game/utilities/Entity/Entity';
import GameInfo from 'server/gamesData/Game/utilities/Entity/components/GameInfo';
import Server from 'server/gamesData/Game/utilities/Entity/components/Server';
import TurnController from 'server/gamesData/Game/utilities/Entity/components/TurnController';

import Hand from 'server/gamesData/Game/HeartsGame/entities/Hand';

export interface TurnResult {
  highestCardPlayerIndex: number;
  takenCards: Card[];
}

export interface TurnOptions {
  startPlayerIndex: number;
}

export default class Turn extends Entity<TurnResult> {
  turnController: TurnController;
  gameInfo = this.obtainComponent(GameInfo<GameType.HEARTS, this>);
  server = this.obtainComponent(Server<GameType.HEARTS, this>);

  playersData = this.gameInfo.createPlayersData<TurnPlayerData>({
    init: () => ({
      playedCard: null,
    }),
  });
  startPlayerIndex: number;

  hand = this.getClosestEntity(Hand);

  constructor(options: TurnOptions) {
    super();

    this.turnController = this.addComponent(TurnController, {
      startPlayerIndex: options.startPlayerIndex,
      isPlayerInPlay: (playerIndex) => !this.playersData.get(playerIndex).playedCard,
    });
    this.startPlayerIndex = options.startPlayerIndex;
  }

  *lifecycle(): EntityGenerator<TurnResult> {
    let playedCards: (Card | null)[];

    while (!(playedCards = this.playersData.map(({ playedCard }) => playedCard)).every(isDefined)) {
      let chosenCardIndex = this.hand.getDeuceOfClubsIndex(this.turnController.activePlayerIndex);

      if (chosenCardIndex === -1) {
        chosenCardIndex = yield* this.server.waitForActivePlayerSocketEvent(GameClientEventType.CHOOSE_CARD);
      }

      this.playersData.getActive().playedCard = this.hand.takePlayerCard(
        this.turnController.activePlayerIndex,
        chosenCardIndex,
      );

      this.turnController.passTurn();

      this.server.sendGameInfo();
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
