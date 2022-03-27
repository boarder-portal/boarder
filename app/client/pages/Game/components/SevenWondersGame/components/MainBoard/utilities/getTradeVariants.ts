import { ISevenWondersPrice } from 'common/types/sevenWonders';
import { IOwnerResource } from 'client/pages/Game/components/SevenWondersGame/components/MainBoard/types';

import getPurchaseVariants
  from 'client/pages/Game/components/SevenWondersGame/components/MainBoard/components/HandCard/utilities/getPurchaseVariants';
import getTradeVariantsByPurchaseVariants
, {
  ITradeVariant,
} from 'client/pages/Game/components/SevenWondersGame/components/MainBoard/components/HandCard/utilities/getTradeVariantsByPurchaseVariants';
import {
  TResourceTradePrices,
} from 'client/pages/Game/components/SevenWondersGame/components/MainBoard/utilities/getResourceTradePrices';

export default function getTradeVariants(
  price: ISevenWondersPrice | undefined,
  resourcePools:  IOwnerResource[][],
  resourceTradePrices: TResourceTradePrices,
): ITradeVariant[] {
  const purchaseVariants = getPurchaseVariants(price, resourcePools);

  return getTradeVariantsByPurchaseVariants(purchaseVariants, resourceTradePrices);
}
