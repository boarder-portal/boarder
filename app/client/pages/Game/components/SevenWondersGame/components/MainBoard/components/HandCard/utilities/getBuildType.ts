import { first } from 'lodash';

import { ISevenWondersPlayer, ISevenWondersPrice } from 'common/types/sevenWonders';
import {
  EBuildType,
} from 'client/pages/Game/components/SevenWondersGame/components/MainBoard/components/HandCard/types';

import {
  ITradeVariant,
} from 'client/pages/Game/components/SevenWondersGame/components/MainBoard/components/HandCard/utilities/getTradeVariantsByPurchaseVariants';

export default function getBuildType(
  price: ISevenWondersPrice,
  player: ISevenWondersPlayer,
  tradeVariants: ITradeVariant[],
): EBuildType {
  const enoughCoins = !price.coins || player.coins >= price.coins;

  if (!enoughCoins) {
    return EBuildType.NOT_ENOUGH_RESOURCES_OR_COINS;
  }

  if (!price.resources) {
    return EBuildType.OWN_RESOURCES_AND_COINS;
  }

  const cheapestTradeVariant = first(tradeVariants);

  if (!cheapestTradeVariant) {
    return EBuildType.NOT_ENOUGH_RESOURCES_OR_COINS;
  }

  const tradeVariantPrice = cheapestTradeVariant.payments.LEFT + cheapestTradeVariant.payments.RIGHT + cheapestTradeVariant.payments.bank;

  if (!tradeVariantPrice) {
    if (!price.coins) {
      return EBuildType.FREE_BY_OWN_RESOURCES;
    }

    return EBuildType.OWN_RESOURCES_AND_COINS;
  }

  if (tradeVariantPrice > player.coins) {
    return EBuildType.NOT_ENOUGH_RESOURCES_OR_COINS;
  }

  return EBuildType.WITH_TRADE;
}
