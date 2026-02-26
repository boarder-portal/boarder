import { BuildingCardDef, NeutralBuildingCardId } from 'common/types/games/outerMinds/cards';

export const NEUTRAL_CARD_DEFS: Record<NeutralBuildingCardId, Omit<BuildingCardDef, 'type'>> = {};
