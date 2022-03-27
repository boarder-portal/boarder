import { useMemo } from 'react';

import { ISevenWondersPlayer, ISevenWondersPrice } from 'common/types/sevenWonders';
import { IOwnerResource } from 'client/pages/Game/components/SevenWondersGame/components/MainBoard/types';

import {
  TResourceTradePrices,
} from 'client/pages/Game/components/SevenWondersGame/components/MainBoard/utilities/getResourceTradePrices';
import getCity from 'common/utilities/sevenWonders/getCity';

import useBuildInfo, {
  IBuildInfo,
} from 'client/pages/Game/components/SevenWondersGame/components/MainBoard/components/HandCard/hooks/useBuildInfo';
import {
  EBuildType,
} from 'client/pages/Game/components/SevenWondersGame/components/MainBoard/components/HandCard/HandCard';

export default function useWonderLevelBuildInfo(
  price: ISevenWondersPrice | undefined,
  resourcePools: IOwnerResource[][],
  resourceTradePrices: TResourceTradePrices,
  player: ISevenWondersPlayer,
): IBuildInfo {
  const wonderLevelBuildInfo = useBuildInfo(price, resourcePools, resourceTradePrices, player);

  return useMemo(() => {
    const city = getCity(player.city, player.citySide);

    if (player.builtStages.length === city.wonders.length) {
      wonderLevelBuildInfo.type = EBuildType.ALREADY_BUILT;
    }

    return wonderLevelBuildInfo;
  }, [player.builtStages.length, player.city, player.citySide, wonderLevelBuildInfo]);
}
