import { BaseCardDef, CardId, CardType } from 'common/types/games/outerMinds/cards/common';
import { CardWithInventory } from 'common/types/games/outerMinds/cards/index';
import { City } from 'common/types/games/outerMinds/city';

export type ObservationCardId = CardId.HIGH_FIVE | CardId.SMALL_FAMILY;

export interface ObservationCardDef extends BaseCardDef {
  type: CardType.OBSERVATION;
  scores: number[];
  check: (city: City, card: CardWithInventory<ObservationCardId>) => boolean;
}
