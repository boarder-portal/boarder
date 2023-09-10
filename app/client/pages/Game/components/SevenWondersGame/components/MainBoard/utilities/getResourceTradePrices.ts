import { NeighborSide } from 'common/types/games/sevenWonders';
import { CardType } from 'common/types/games/sevenWonders/cards';
import { TradeEffect } from 'common/types/games/sevenWonders/effects';

const BASE_RESOURCE_PRICE = 2;

export type ResourceTradePrices = Record<
  NeighborSide,
  {
    [CardType.RAW_MATERIAL]: number;
    [CardType.MANUFACTURED_GOODS]: number;
  }
>;

export default function getResourceTradePrices(tradeEffects: TradeEffect[]): ResourceTradePrices {
  return tradeEffects.reduce(
    (accTradeResourcePrices, tradeEffect) => {
      tradeEffect.sources.forEach((resourceOwner) => {
        if (resourceOwner !== NeighborSide.LEFT && resourceOwner !== NeighborSide.RIGHT) {
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
      [NeighborSide.LEFT]: {
        [CardType.RAW_MATERIAL]: BASE_RESOURCE_PRICE,
        [CardType.MANUFACTURED_GOODS]: BASE_RESOURCE_PRICE,
      },
      [NeighborSide.RIGHT]: {
        [CardType.RAW_MATERIAL]: BASE_RESOURCE_PRICE,
        [CardType.MANUFACTURED_GOODS]: BASE_RESOURCE_PRICE,
      },
    },
  );
}
