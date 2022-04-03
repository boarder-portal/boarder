import { uniqBy } from 'lodash';
import sortBy from 'lodash/sortBy';

import { IOwnerResource } from 'client/pages/Game/components/SevenWondersGame/components/MainBoard/types';
import { ESevenWondersNeighborSide, TSevenWondersPayments } from 'common/types/sevenWonders';

import {
  TResourceTradePrices,
} from 'client/pages/Game/components/SevenWondersGame/components/MainBoard/utilities/getResourceTradePrices';
import getResourceType from 'common/utilities/sevenWonders/getResourcePrice';

export interface ITradeVariant {
  resources: IOwnerResource[];
  payments: TSevenWondersPayments;
}

function getActualTradeVariants(variants: ITradeVariant[]): ITradeVariant[] {
  const actualTradeVariants: ITradeVariant[] = [];

  variants.forEach((variant) => {
    if (
      actualTradeVariants.some((actualTradeVariant) =>
        actualTradeVariant.payments.LEFT <= variant.payments.LEFT && actualTradeVariant.payments.RIGHT <= variant.payments.RIGHT)
    ) {
      return;
    }

    actualTradeVariants.push(variant);
  });

  return actualTradeVariants;
}

export default function getTradeVariantsByPurchaseVariants(purchaseVariants: IOwnerResource[][], resourceTradePrices: TResourceTradePrices): ITradeVariant[] {
  const tradeVariants = purchaseVariants.map((purchaseVariant) => {
    const payments: TSevenWondersPayments = {
      [ESevenWondersNeighborSide.LEFT]: 0,
      [ESevenWondersNeighborSide.RIGHT]: 0,
    };

    purchaseVariant.forEach((resource) => {
      if (resource.owner === ESevenWondersNeighborSide.LEFT || resource.owner === ESevenWondersNeighborSide.RIGHT) {
        payments[resource.owner] += resourceTradePrices[resource.owner][getResourceType(resource.type)];
      }
    });

    return {
      resources: purchaseVariant,
      payments,
    };
  });

  const uniqTradeVariants = uniqBy(tradeVariants, ({ payments }) => `left_${payments.LEFT}_right_${payments.RIGHT}`);

  const sortedTradeVariants = sortBy(uniqTradeVariants, ({ payments }) => payments.LEFT + payments.RIGHT + Math.abs(payments.LEFT - payments.RIGHT) / 100);

  return getActualTradeVariants(sortedTradeVariants);
}
