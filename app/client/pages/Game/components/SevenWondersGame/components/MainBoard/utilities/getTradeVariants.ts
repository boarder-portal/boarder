import { OwnerResource } from 'client/pages/Game/components/SevenWondersGame/components/MainBoard/types';
import { Price } from 'common/types/sevenWonders';

import getPurchaseVariants from 'client/pages/Game/components/SevenWondersGame/components/MainBoard/components/HandCard/utilities/getPurchaseVariants';
import getTradeVariantsByPurchaseVariants, {
  TradeVariant,
} from 'client/pages/Game/components/SevenWondersGame/components/MainBoard/components/HandCard/utilities/getTradeVariantsByPurchaseVariants';
import { ResourceTradePrices } from 'client/pages/Game/components/SevenWondersGame/components/MainBoard/utilities/getResourceTradePrices';

export default function getTradeVariants(
  price: Price | undefined,
  resourcePools: OwnerResource[][],
  resourceTradePrices: ResourceTradePrices,
): TradeVariant[] {
  const purchaseVariants = getPurchaseVariants(price, resourcePools);

  return getTradeVariantsByPurchaseVariants(purchaseVariants, resourceTradePrices);
}
