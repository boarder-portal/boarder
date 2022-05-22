import uniqBy from 'lodash/uniqBy';
import sortBy from 'lodash/sortBy';

import { IOwnerResource } from 'client/pages/Game/components/SevenWondersGame/components/MainBoard/types';
import { ENeighborSide, TPayments } from 'common/types/sevenWonders';

import { TResourceTradePrices } from 'client/pages/Game/components/SevenWondersGame/components/MainBoard/utilities/getResourceTradePrices';
import getResourceType from 'common/utilities/sevenWonders/getResourcePrice';

export interface ITradeVariant {
  resources: IOwnerResource[];
  payments: TPayments;
}

function getActualTradeVariants(variants: ITradeVariant[]): ITradeVariant[] {
  const actualTradeVariants: ITradeVariant[] = [];

  variants.forEach((variant) => {
    if (
      actualTradeVariants.some(
        (actualTradeVariant) =>
          actualTradeVariant.payments.LEFT <= variant.payments.LEFT &&
          actualTradeVariant.payments.RIGHT <= variant.payments.RIGHT &&
          actualTradeVariant.payments.bank <= variant.payments.bank,
      )
    ) {
      return;
    }

    actualTradeVariants.push(variant);
  });

  return actualTradeVariants;
}

export default function getTradeVariantsByPurchaseVariants(
  purchaseVariants: IOwnerResource[][],
  resourceTradePrices: TResourceTradePrices,
): ITradeVariant[] {
  const tradeVariants = purchaseVariants.map((purchaseVariant) => {
    const payments: TPayments = {
      [ENeighborSide.LEFT]: 0,
      [ENeighborSide.RIGHT]: 0,
      bank: 0,
    };

    purchaseVariant.forEach((resource) => {
      if (
        resource.owner === ENeighborSide.LEFT ||
        resource.owner === ENeighborSide.RIGHT ||
        resource.owner === 'bank'
      ) {
        payments[resource.owner] +=
          resource.owner === 'bank' ? 1 : resourceTradePrices[resource.owner][getResourceType(resource.type)];
      }
    });

    return {
      resources: purchaseVariant,
      payments,
    };
  });

  const uniqTradeVariants = uniqBy(
    tradeVariants,
    ({ payments }) => `left_${payments.LEFT}_right_${payments.RIGHT}_bank_${payments.bank}`,
  );

  const sortedTradeVariants = sortBy(
    uniqTradeVariants,
    ({ payments }) => payments.LEFT + payments.RIGHT + payments.bank + Math.abs(payments.LEFT - payments.RIGHT) / 100,
  );

  return getActualTradeVariants(sortedTradeVariants);
}
