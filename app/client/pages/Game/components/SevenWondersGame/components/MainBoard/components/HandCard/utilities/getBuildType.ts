import { first } from 'lodash';

import { IPlayer, IPrice } from 'common/types/sevenWonders';
import {
  EBuildType,
} from 'client/pages/Game/components/SevenWondersGame/components/MainBoard/components/HandCard/types';

import {
  ITradeVariant,
} from 'client/pages/Game/components/SevenWondersGame/components/MainBoard/components/HandCard/utilities/getTradeVariantsByPurchaseVariants';

export default function getBuildType(
  price: IPrice,
  player: IPlayer,
  tradeVariants: ITradeVariant[],
  discount: number,
): EBuildType {
  const cardCoinsPrice = price.coins ? price.coins - discount : 0;
  const enoughCoins = player.coins >= cardCoinsPrice;

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
    if (!cardCoinsPrice) {
      return EBuildType.FREE_BY_OWN_RESOURCES;
    }

    return EBuildType.OWN_RESOURCES_AND_COINS;
  }

  if (tradeVariantPrice > player.coins) {
    return EBuildType.NOT_ENOUGH_RESOURCES_OR_COINS;
  }

  return EBuildType.WITH_TRADE;
}
