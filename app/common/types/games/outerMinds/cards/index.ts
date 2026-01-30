import { AbilityCardDef } from 'common/types/games/outerMinds/cards/abilities';
import { ActionCardDef } from 'common/types/games/outerMinds/cards/actions';
import { BuildingCardDef, RealBuildingCategory } from 'common/types/games/outerMinds/cards/builidings';
import { CardId } from 'common/types/games/outerMinds/cards/common';
import { ObservationCardDef } from 'common/types/games/outerMinds/cards/observations';
import { Human } from 'common/types/games/outerMinds/common';

export * from './common';
export * from './builidings';
export * from './observations';
export * from './actions';
export * from './abilities';

export type CardDef = BuildingCardDef | ObservationCardDef | ActionCardDef | AbilityCardDef;

export type CardWithInventory<Id extends CardId> = {
  id: Id;
  gold: number;
  humans: Human[];
  decrees: number;
  categories: RealBuildingCategory[];
  supporters: number;
  cards: CardId[];
};
