import { ITradeEffect } from 'common/types/sevenWonders/effects';
import { ENeighborSide } from 'common/types/sevenWonders';
import { ECardType } from 'common/types/sevenWonders/cards';

const BASE_RESOURCE_PRICE = 2;

export type TResourceTradePrices = Record<
  ENeighborSide,
  {
    [ECardType.RAW_MATERIAL]: number;
    [ECardType.MANUFACTURED_GOODS]: number;
  }
>;

export default function getResourceTradePrices(tradeEffects: ITradeEffect[]): TResourceTradePrices {
  return tradeEffects.reduce(
    (accTradeResourcePrices, tradeEffect) => {
      tradeEffect.sources.forEach((resourceOwner) => {
        if (resourceOwner !== ENeighborSide.LEFT && resourceOwner !== ENeighborSide.RIGHT) {
          return;
        }

        tradeEffect.resources.forEach((resource) => {
          accTradeResourcePrices[resourceOwner][resource] = Math.min(
            accTradeResourcePrices[resourceOwner][resource],
            tradeEffect.price,
          );
        });
      });

      return accTradeResourcePrices;
    },
    {
      [ENeighborSide.LEFT]: {
        [ECardType.RAW_MATERIAL]: BASE_RESOURCE_PRICE,
        [ECardType.MANUFACTURED_GOODS]: BASE_RESOURCE_PRICE,
      },
      [ENeighborSide.RIGHT]: {
        [ECardType.RAW_MATERIAL]: BASE_RESOURCE_PRICE,
        [ECardType.MANUFACTURED_GOODS]: BASE_RESOURCE_PRICE,
      },
    },
  );
}
