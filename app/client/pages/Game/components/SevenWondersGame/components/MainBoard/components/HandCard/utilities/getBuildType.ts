import { first } from 'lodash';

import { ISevenWondersPlayer, ISevenWondersPrice } from 'common/types/sevenWonders';

import {
  ITradeVariant,
} from 'client/pages/Game/components/SevenWondersGame/components/MainBoard/components/HandCard/utilities/getTradeVariantsByPurchaseVariants';

import {
  EBuildType,
} from 'client/pages/Game/components/SevenWondersGame/components/MainBoard/components/HandCard/HandCard';

export default function getBuildType(
  price: ISevenWondersPrice,
  player: ISevenWondersPlayer,
  tradeVariants: ITradeVariant[],
): EBuildType {
  const enoughCoins = !price.coins || player.coins >= price.coins;

  if (!enoughCoins) {
    return EBuildType.NOT_AVAILABLE;
  }

  if (!price.resources) {
    return EBuildType.OWN_RESOURCES_AND_COINS;
  }

  const cheapestTradeVariant = first(tradeVariants);

  if (!cheapestTradeVariant) {
    return EBuildType.NOT_AVAILABLE;
  }

  const tradeVariantPrice = cheapestTradeVariant.payments.LEFT + cheapestTradeVariant.payments.RIGHT;

  if (!tradeVariantPrice) {
    return EBuildType.OWN_RESOURCES_AND_COINS;
  }

  if (tradeVariantPrice > player.coins) {
    return EBuildType.NOT_AVAILABLE;
  }

  return EBuildType.WITH_TRADE;
}
