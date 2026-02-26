import { COMMUNITY_CARD_DEFS } from 'common/constants/games/outerMinds/cards/buildings/community';
import { FINANCIAL_CARD_DEFS } from 'common/constants/games/outerMinds/cards/buildings/financial';
import { INDUSTRIAL_CARD_DEFS } from 'common/constants/games/outerMinds/cards/buildings/industrial';
import { NEUTRAL_CARD_DEFS } from 'common/constants/games/outerMinds/cards/buildings/neutral';
import { RESIDENTIAL_CARD_DEFS } from 'common/constants/games/outerMinds/cards/buildings/residential';
import { STATE_CARD_DEFS } from 'common/constants/games/outerMinds/cards/buildings/state';
import { TRANSPORT_CARD_DEFS } from 'common/constants/games/outerMinds/cards/buildings/transport';

import { BuildingCardDef, BuildingCardId, CardType } from 'common/types/games/outerMinds/cards';

import { addCardDefType } from 'common/utilities/games/outerMinds/cardDefs';

export const BUILDING_CARD_DEFS: Record<BuildingCardId, BuildingCardDef> = addCardDefType(CardType.BUILDING, {
  ...RESIDENTIAL_CARD_DEFS,
  ...COMMUNITY_CARD_DEFS,
  ...FINANCIAL_CARD_DEFS,
  ...TRANSPORT_CARD_DEFS,
  ...INDUSTRIAL_CARD_DEFS,
  ...STATE_CARD_DEFS,
  ...NEUTRAL_CARD_DEFS,
});
