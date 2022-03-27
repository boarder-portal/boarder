import { first } from 'lodash';

import { ISevenWondersCardPrice } from 'common/types/sevenWonders/cards';
import { ISevenWondersPlayer } from 'common/types/sevenWonders';

import {
  ITradeVariant,
} from 'client/pages/Game/components/SevenWondersGame/components/MainBoard/components/HandCard/utilities/getTradeVariants';

import {
  EBuildType,
} from 'client/pages/Game/components/SevenWondersGame/components/MainBoard/components/HandCard/HandCard';

export default function getBuildType(
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

  const enoughCoins = !cardPrice.coins || player.coins >= cardPrice.coins;

  if (!enoughCoins) {
    return EBuildType.NOT_AVAILABLE;
  }

  if (!cardPrice.resources) {
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
