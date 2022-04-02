import { ISevenWondersCard } from 'common/types/sevenWonders/cards';
import { ISevenWondersPlayer } from 'common/types/sevenWonders';
import {
  EBuildType,
} from 'client/pages/Game/components/SevenWondersGame/components/MainBoard/components/HandCard/types';

import {
  ITradeVariant,
} from 'client/pages/Game/components/SevenWondersGame/components/MainBoard/components/HandCard/utilities/getTradeVariantsByPurchaseVariants';
import getBuildType
  from 'client/pages/Game/components/SevenWondersGame/components/MainBoard/components/HandCard/utilities/getBuildType';

export default function getCardBuildType(
  card: ISevenWondersCard,
  player: ISevenWondersPlayer,
  tradeVariants: ITradeVariant[],
): EBuildType {
  if (player.builtCards.some((builtCard) => builtCard.id === card.id)) {
    return EBuildType.ALREADY_BUILT;
  }

  const { price } = card;

  if (!price) {
    return EBuildType.FREE;
  }

  if (price.buildings &&
    player.builtCards
      .some((builtCard) =>
        price.buildings?.includes(builtCard.id))
  ) {
    return EBuildType.FOR_BUILDING;
  }

  return getBuildType(price, player, tradeVariants);
}
