import { BuildingCategory } from 'common/types/games/outsideMind/cards/builidings';
import { CardId } from 'common/types/games/outsideMind/cards/common';
import { Human } from 'common/types/games/outsideMind/common';

export * from './common';
export * from './builidings';
export * from './observations';
export * from './actions';
export * from './abilities';

export type CardWithInventory<Id extends CardId> = {
  id: Id;
  gold: number;
  humans: Human[];
  decrees: number;
  categories: BuildingCategory[];
  supporters: number;
  cards: CardId[];
};
