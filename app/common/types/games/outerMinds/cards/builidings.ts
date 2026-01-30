import { BaseCardDef, CardId, CardType } from 'common/types/games/outerMinds/cards/common';
import { Human } from 'common/types/games/outerMinds/common';

export enum BuildingCategory {
  RESIDENTIAL = 'RESIDENTIAL',
  COMMUNITY = 'COMMUNITY',
  FINANCIAL = 'FINANCIAL',
  TRANSPORT = 'TRANSPORT',
  INDUSTRIAL = 'INDUSTRIAL',
  STATE = 'STATE',
  NEUTRAL = 'NEUTRAL',
}

export type BuildingCardId = CardId.NURSING_HOME | CardId.PRISON;

export interface BuildingCardDef extends BaseCardDef {
  type: CardType.BUILDING;
  category: BuildingCategory;
  isStarting: boolean;
  energy: number;
  startingHumans: Partial<Record<Human, number>>;
  startingGold?: number;
}
