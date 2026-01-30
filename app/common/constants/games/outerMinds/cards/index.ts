import { abilityCardDefs } from 'common/constants/games/outerMinds/cards/abilities';
import { actionCardDefs } from 'common/constants/games/outerMinds/cards/actions';
import { buildingCardDefs } from 'common/constants/games/outerMinds/cards/buildings';
import { observationCardDefs } from 'common/constants/games/outerMinds/cards/observations';

import { CardDef, CardId } from 'common/types/games/outerMinds/cards';

export * from './buildings';
export * from './observations';
export * from './actions';
export * from './abilities';

export const cardDefs: Record<CardId, CardDef> = {
  ...buildingCardDefs,
  ...observationCardDefs,
  ...actionCardDefs,
  ...abilityCardDefs,
};
