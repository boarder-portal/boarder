import first from 'lodash/first';

import { BuildKind } from 'client/pages/Game/components/SevenWondersGame/components/MainBoard/components/HandCard/types';
import { Player, Price } from 'common/types/sevenWonders';

import { TradeVariant } from 'client/pages/Game/components/SevenWondersGame/components/MainBoard/components/HandCard/utilities/getTradeVariantsByPurchaseVariants';

export default function getBuildType(
  price: Price,
  player: Player,
  tradeVariants: TradeVariant[],
  discount: number,
): BuildKind {
  const cardCoinsPrice = price.coins ? price.coins - discount : 0;
  const enoughCoins = player.data.coins >= cardCoinsPrice;

  if (!enoughCoins) {
    return BuildKind.NOT_ENOUGH_RESOURCES_OR_COINS;
  }

  if (!price.resources) {
    return BuildKind.OWN_RESOURCES_AND_COINS;
  }

  const cheapestTradeVariant = first(tradeVariants);

  if (!cheapestTradeVariant) {
    return BuildKind.NOT_ENOUGH_RESOURCES_OR_COINS;
  }

  const tradeVariantPrice =
    cheapestTradeVariant.payments.LEFT + cheapestTradeVariant.payments.RIGHT + cheapestTradeVariant.payments.bank;

  if (!tradeVariantPrice) {
    if (!cardCoinsPrice) {
      return BuildKind.FREE_BY_OWN_RESOURCES;
    }

    return BuildKind.OWN_RESOURCES_AND_COINS;
  }

  if (tradeVariantPrice > player.data.coins) {
    return BuildKind.NOT_ENOUGH_RESOURCES_OR_COINS;
  }

  return BuildKind.WITH_TRADE;
}
