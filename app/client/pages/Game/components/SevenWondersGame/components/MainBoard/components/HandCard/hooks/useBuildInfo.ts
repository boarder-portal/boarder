import { useMemo } from 'react';

import { ISevenWondersPlayer, ISevenWondersPrice } from 'common/types/sevenWonders';
import { ISevenWondersCardPrice } from 'common/types/sevenWonders/cards';
import { IOwnerResource } from 'client/pages/Game/components/SevenWondersGame/components/MainBoard/types';

import getTradeVariants
  from 'client/pages/Game/components/SevenWondersGame/components/MainBoard/utilities/getTradeVariants';
import {
  TResourceTradePrices,
} from 'client/pages/Game/components/SevenWondersGame/components/MainBoard/utilities/getResourceTradePrices';
import getCardBuildType
  from 'client/pages/Game/components/SevenWondersGame/components/MainBoard/components/HandCard/utilities/getCardBuildType';
import {
  ITradeVariant,
} from 'client/pages/Game/components/SevenWondersGame/components/MainBoard/components/HandCard/utilities/getTradeVariantsByPurchaseVariants';

import {
  EBuildType,
} from 'client/pages/Game/components/SevenWondersGame/components/MainBoard/components/HandCard/HandCard';

export interface IBuildInfo {
  type: EBuildType;
  tradeVariants: ITradeVariant[];
}

export default function useBuildInfo(
  price: ISevenWondersPrice | ISevenWondersCardPrice | undefined,
  resourcePools: IOwnerResource[][],
  resourceTradePrices: TResourceTradePrices,
  player: ISevenWondersPlayer,
): IBuildInfo {
  const tradeVariants = useMemo(() => getTradeVariants(price, resourcePools, resourceTradePrices), [price, resourcePools, resourceTradePrices]);

  const type = useMemo(() => getCardBuildType(price, player, tradeVariants), [player, price, tradeVariants]);

  return useMemo(() => ({
    type,
    tradeVariants,
  }), [tradeVariants, type]);
}
