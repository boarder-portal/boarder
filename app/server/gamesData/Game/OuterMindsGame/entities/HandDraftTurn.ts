import { HandDraftTurn as HandDraftModel } from 'common/types/games/outerMinds';
import { CardId } from 'common/types/games/outerMinds/cards';

import Entity, { EntityGenerator } from 'server/gamesData/Game/utilities/Entity/Entity';

export interface HandDraftTurnOptions {
  cards: CardId[];
}

export class HandDraftTurn extends Entity<CardId[]> {
  cards: CardId[];

  constructor(options: HandDraftTurnOptions) {
    super();

    this.cards = options.cards;
  }

  *lifecycle(): EntityGenerator<CardId[]> {
    // TODO: logic
    return [];
  }

  toJSON(): HandDraftModel {
    return {
      cards: this.cards,
    };
  }
}
