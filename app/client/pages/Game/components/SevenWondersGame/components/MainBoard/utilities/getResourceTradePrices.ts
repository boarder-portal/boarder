import { ISevenWondersTradeEffect } from 'common/types/sevenWonders/effects';
import { ESevenWondersNeighborSide } from 'common/types/sevenWonders';
import { ESevenWondersCardType } from 'common/types/sevenWonders/cards';

const BASE_RESOURCE_PRICE = 2;

export type TResourceTradePrices = Record<ESevenWondersNeighborSide, {
  [ESevenWondersCardType.RAW_MATERIAL]: number,
  [ESevenWondersCardType.MANUFACTURED_GOODS]: number,
}>;

export default function getResourceTradePrices(tradeEffects: ISevenWondersTradeEffect[]): TResourceTradePrices {
  return tradeEffects.reduce((
    accTradeResourcePrices,
    tradeEffect,
  ) => {
    tradeEffect.neighbors.forEach((neighborSide) => {
      accTradeResourcePrices[neighborSide][tradeEffect.resource] = Math.min(
        accTradeResourcePrices[neighborSide][tradeEffect.resource],
        tradeEffect.price,
      );
    });

    return accTradeResourcePrices;
  }, {
    [ESevenWondersNeighborSide.LEFT]: {
      [ESevenWondersCardType.RAW_MATERIAL]: BASE_RESOURCE_PRICE,
      [ESevenWondersCardType.MANUFACTURED_GOODS]: BASE_RESOURCE_PRICE,
    },
    [ESevenWondersNeighborSide.RIGHT]: {
      [ESevenWondersCardType.RAW_MATERIAL]: BASE_RESOURCE_PRICE,
      [ESevenWondersCardType.MANUFACTURED_GOODS]: BASE_RESOURCE_PRICE,
    },
  });
}
