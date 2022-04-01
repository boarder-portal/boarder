import { ISevenWondersCardPrice } from 'common/types/sevenWonders/cards';
import { ISevenWondersPlayer } from 'common/types/sevenWonders';

import {
  ITradeVariant,
} from 'client/pages/Game/components/SevenWondersGame/components/MainBoard/components/HandCard/utilities/getTradeVariantsByPurchaseVariants';
import getBuildType
  from 'client/pages/Game/components/SevenWondersGame/components/MainBoard/components/HandCard/utilities/getBuildType';

import {
  EBuildType,
} from 'client/pages/Game/components/SevenWondersGame/components/MainBoard/components/HandCard/HandCard';

export default function getCardBuildType(
  cardPrice: ISevenWondersCardPrice | undefined,
  player: ISevenWondersPlayer,
  tradeVariants: ITradeVariant[],
): EBuildType {
  if (!cardPrice) {
    return EBuildType.FREE;
  }

  if (cardPrice.buildings &&
    player.builtCards
      .some((builtCard) =>
        cardPrice.buildings?.some((id) => id === builtCard.id))
  ) {
    return EBuildType.FOR_BUILDING;
  }

  return getBuildType(cardPrice, player, tradeVariants);
}
