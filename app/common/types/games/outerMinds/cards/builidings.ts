import { CardId, CardType } from 'common/types/games/outerMinds/cards/common';

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

export interface BuildingCardDef {
  type: CardType.BUILDING;
}
