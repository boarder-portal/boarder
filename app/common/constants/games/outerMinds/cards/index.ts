import { ABILITY_CARD_DEFS } from 'common/constants/games/outerMinds/cards/abilities';
import { ACTION_CARD_DEFS } from 'common/constants/games/outerMinds/cards/actions';
import { BUILDING_CARD_DEFS } from 'common/constants/games/outerMinds/cards/buildings';
import { OBSERVATION_CARD_DEFS } from 'common/constants/games/outerMinds/cards/observations';

import { CardDef, CardId } from 'common/types/games/outerMinds/cards';

import { getBuildingCardDef, isBuildingCardId } from 'common/utilities/games/outerMinds/cards/buildings';

export * from './buildings';
export * from './observations';
export * from './actions';
export * from './abilities';

export const CARD_DEFS: Record<CardId, CardDef> = {
  ...BUILDING_CARD_DEFS,
  ...OBSERVATION_CARD_DEFS,
  ...ACTION_CARD_DEFS,
  ...ABILITY_CARD_DEFS,
};

export const ALL_CARDS = Object.values(CardId);
export const STARTING_BUILDING_CARDS = ALL_CARDS.filter(isBuildingCardId).filter(
  (cardId) => getBuildingCardDef(cardId).isStarting,
);
