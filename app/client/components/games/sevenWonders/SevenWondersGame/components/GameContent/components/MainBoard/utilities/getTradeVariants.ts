import { OwnerResource } from 'client/components/games/sevenWonders/SevenWondersGame/components/GameContent/components/MainBoard/types';
import { Price } from 'common/types/games/sevenWonders';

import getPurchaseVariants from 'client/components/games/sevenWonders/SevenWondersGame/components/GameContent/components/MainBoard/components/HandCard/utilities/getPurchaseVariants';
import getTradeVariantsByPurchaseVariants, {
  TradeVariant,
} from 'client/components/games/sevenWonders/SevenWondersGame/components/GameContent/components/MainBoard/components/HandCard/utilities/getTradeVariantsByPurchaseVariants';
import { ResourceTradePrices } from 'client/components/games/sevenWonders/SevenWondersGame/components/GameContent/components/MainBoard/utilities/getResourceTradePrices';

export default function getTradeVariants(
  price: Price | undefined,
  resourcePools: OwnerResource[][],
  resourceTradePrices: ResourceTradePrices,
): TradeVariant[] {
  const purchaseVariants = getPurchaseVariants(price, resourcePools);

  return getTradeVariantsByPurchaseVariants(purchaseVariants, resourceTradePrices);
}
