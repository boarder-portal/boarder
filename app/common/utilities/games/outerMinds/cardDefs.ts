import mapValues from 'lodash/mapValues';

import { buildingCardDefs, cardDefs } from 'common/constants/games/outerMinds/cards';

import { BuildingCardDef, BuildingCardId, CardDef, CardId, CardType } from 'common/types/games/outerMinds/cards';

export function addCardDefType<Id extends CardId, CardDefs, Type extends CardType>(
  cardType: Type,
  cardDefs: Record<Id, CardDefs>,
): Record<Id, CardDefs & { type: Type }> {
  return mapValues(cardDefs, (cardDefs) => ({
    ...cardDefs,
    type: cardType,
  }));
}

export function getCardDef(cardId: CardId): CardDef {
  return cardDefs[cardId];
}

export function getBuildingCardDef(cardId: BuildingCardId): BuildingCardDef {
  return buildingCardDefs[cardId];
}
