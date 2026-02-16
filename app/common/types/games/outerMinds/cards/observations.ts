import { BaseCardDef, CardId, CardType } from 'common/types/games/outerMinds/cards/common';
import { CardWithInventory } from 'common/types/games/outerMinds/cards/index';
import { City } from 'common/types/games/outerMinds/city';

export type ObservationCardId =
  | CardId.HIGH_FIVE
  | CardId.TWO_TIMES_TWO
  | CardId.DOMINATING_KIND
  | CardId.SINGLE_LANDMARK
  | CardId.EMERALD_CITY
  | CardId.TWO_OF_EVERY_KIND
  | CardId.CATEGORICAL_BALANCE
  | CardId.SMALL_FAMILY
  | CardId.GRANDPAS_FORTUNE;

export interface ObservationCardDef extends BaseCardDef {
  type: CardType.OBSERVATION;
  scores: number[];
  check: (city: City, card: CardWithInventory<ObservationCardId>) => boolean;
}
