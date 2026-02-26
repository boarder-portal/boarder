import { BuildingCardDef, FinancialBuildingCardId } from 'common/types/games/outerMinds/cards';

export const FINANCIAL_CARD_DEFS: Record<FinancialBuildingCardId, Omit<BuildingCardDef, 'type'>> = {};
