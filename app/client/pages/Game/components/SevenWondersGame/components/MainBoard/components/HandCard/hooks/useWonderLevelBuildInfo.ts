import { useCallback, useMemo } from 'react';

import {
  ESevenWondersCardActionType,
  ISevenWondersPlayer,
  ISevenWondersPrice, TSevenWondersAction, TSevenWondersBuildType,
  TSevenWondersPayments,
} from 'common/types/sevenWonders';
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
import getPossibleBuildActions from 'common/utilities/sevenWonders/getPossibleBuildActions';

function getTitle(buildType: EBuildType): string {
  switch (buildType) {
    case EBuildType.FREE:
    case EBuildType.FREE_BY_BUILDING:
    case EBuildType.FREE_BY_OWN_RESOURCES:
    case EBuildType.FREE_WITH_EFFECT:
    case EBuildType.OWN_RESOURCES_AND_COINS: {
      return 'Заложить';
    }

    case EBuildType.WITH_TRADE: {
      return 'Заложить c торговлей';
    }

    case EBuildType.ALREADY_BUILT: {
      return 'Уже построены';
    }

    case EBuildType.NOT_ENOUGH_RESOURCES_OR_COINS:
    case EBuildType.NOT_ALLOWED: {
      return 'Нельзя заложить';
    }
  }
}

export default function useWonderLevelBuildInfo(
  price: ISevenWondersPrice,
  resourcePools: IOwnerResource[][],
  resourceTradePrices: TResourceTradePrices,
  player: ISevenWondersPlayer,
  onCardAction: (cardIndex: number, action: TSevenWondersAction, payments?: TSevenWondersPayments) => void,
): IBuildInfo {
  const tradeVariants = useMemo(() => getTradeVariants(price, resourcePools, resourceTradePrices), [price, resourcePools, resourceTradePrices]);

  const possibleBuildActions = getPossibleBuildActions(player);

  const type = useMemo(() => {
    const city = getCity(player.city, player.citySide);

    if (player.builtStages.length === city.wonders.length) {
      return EBuildType.ALREADY_BUILT;
    }

    if (!possibleBuildActions.includes(ESevenWondersCardActionType.BUILD_WONDER_STAGE)) {
      return EBuildType.NOT_ALLOWED;
    }

    return getBuildType(price, player, tradeVariants, 0);
  }, [player, price, tradeVariants, possibleBuildActions]);

  const title = useMemo(() => getTitle(type), [type]);

  const onBuild = useCallback((cardIndex: number, freeBuildType: TSevenWondersBuildType | null, payments?: TSevenWondersPayments) => {
    onCardAction(cardIndex, {
      type: ESevenWondersCardActionType.BUILD_WONDER_STAGE,
      stageIndex: player.builtStages.length,
    }, payments);
  }, [onCardAction, player.builtStages.length]);

  return useMemo(() => ({
    type,
    title,
    tradeVariants,
    onBuild,
  }), [onBuild, title, tradeVariants, type]);
}
