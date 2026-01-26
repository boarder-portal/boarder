import { CardId, CardType } from 'common/types/games/outerMinds/cards/common';

export type ObservationCardId = CardId.HIGH_FIVE | CardId.SMALL_FAMILY;

export interface ObservationCardDef {
  type: CardType.OBSERVATION;
}
