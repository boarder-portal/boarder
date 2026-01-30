import { DRAFT_PHASE_PICK_CARDS_COUNT } from 'common/constants/games/outerMinds';

import { GameType } from 'common/types/game';
import { GameClientEventType, HandDraftTurn as HandDraftModel } from 'common/types/games/outerMinds';
import { CardId } from 'common/types/games/outerMinds/cards';

import Entity, { EntityGenerator } from 'server/gamesData/Game/utilities/Entity/Entity';
import Server from 'server/gamesData/Game/utilities/Entity/components/Server';

export interface HandDraftTurnOptions {
  cards: CardId[];
}

export class HandDraftTurn extends Entity<CardId[]> {
  server = this.obtainComponent(Server<GameType.OUTER_MINDS, this>);

  cards: CardId[];

  constructor(options: HandDraftTurnOptions) {
    super();

    this.cards = options.cards;
  }

  *lifecycle(): EntityGenerator<CardId[]> {
    return yield* this.server.waitForActivePlayerSocketEvent(GameClientEventType.PICK_CARDS, {
      validate: (cards) =>
        cards.length === DRAFT_PHASE_PICK_CARDS_COUNT && cards.every((cardId) => this.cards.includes(cardId)),
    });
  }

  toJSON(): HandDraftModel {
    return {
      cards: this.cards,
    };
  }
}
