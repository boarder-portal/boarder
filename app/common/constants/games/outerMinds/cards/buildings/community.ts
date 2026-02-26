import { BuildingCardDef, CommunityBuildingCardId } from 'common/types/games/outerMinds/cards';

export const COMMUNITY_CARD_DEFS: Record<CommunityBuildingCardId, Omit<BuildingCardDef, 'type'>> = {};
