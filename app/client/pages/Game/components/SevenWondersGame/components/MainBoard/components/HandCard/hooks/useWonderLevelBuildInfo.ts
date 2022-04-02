import { useMemo } from 'react';

import { ISevenWondersPlayer, ISevenWondersPrice } from 'common/types/sevenWonders';
import { IOwnerResource } from 'client/pages/Game/components/SevenWondersGame/components/MainBoard/types';
import {
  EBuildType,
  IBuildInfo,
} from 'client/pages/Game/components/SevenWondersGame/components/MainBoard/components/HandCard/types';

import getTradeVariants
  from 'client/pages/Game/components/SevenWondersGame/components/MainBoard/utilities/getTradeVariants';
import {
  TResourceTradePrices,
} from 'client/pages/Game/components/SevenWondersGame/components/MainBoard/utilities/getResourceTradePrices';
import getBuildType
  from 'client/pages/Game/components/SevenWondersGame/components/MainBoard/components/HandCard/utilities/getBuildType';
import getCity from 'common/utilities/sevenWonders/getCity';

export default function useWonderLevelBuildInfo(
  price: ISevenWondersPrice,
  resourcePools: IOwnerResource[][],
  resourceTradePrices: TResourceTradePrices,
  player: ISevenWondersPlayer,
): IBuildInfo {
  const tradeVariants = useMemo(() => getTradeVariants(price, resourcePools, resourceTradePrices), [price, resourcePools, resourceTradePrices]);

  const type = useMemo(() => {
    const city = getCity(player.city, player.citySide);

    if (player.builtStages.length === city.wonders.length) {
      return EBuildType.ALREADY_BUILT;
    }

    return getBuildType(price, player, tradeVariants);
  }, [price, player, tradeVariants]);

  return useMemo(() => ({
    type,
    tradeVariants,
  }), [tradeVariants, type]);
}
