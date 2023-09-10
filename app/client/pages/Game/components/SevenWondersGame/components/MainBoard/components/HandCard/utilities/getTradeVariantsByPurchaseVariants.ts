import sortBy from 'lodash/sortBy';
import uniqBy from 'lodash/uniqBy';

import { OwnerResource } from 'client/pages/Game/components/SevenWondersGame/components/MainBoard/types';
import { NeighborSide, Payments } from 'common/types/sevenWonders';

import { ResourceTradePrices } from 'client/pages/Game/components/SevenWondersGame/components/MainBoard/utilities/getResourceTradePrices';
import getResourceType from 'common/utilities/sevenWonders/getResourcePrice';

export interface TradeVariant {
  resources: OwnerResource[];
  payments: Payments;
}

function getActualTradeVariants(variants: TradeVariant[]): TradeVariant[] {
  const actualTradeVariants: TradeVariant[] = [];

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
  purchaseVariants: OwnerResource[][],
  resourceTradePrices: ResourceTradePrices,
): TradeVariant[] {
  const tradeVariants = purchaseVariants.map((purchaseVariant) => {
    const payments: Payments = {
      [NeighborSide.LEFT]: 0,
      [NeighborSide.RIGHT]: 0,
      bank: 0,
    };

    purchaseVariant.forEach((resource) => {
      if (resource.owner === NeighborSide.LEFT || resource.owner === NeighborSide.RIGHT || resource.owner === 'bank') {
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
