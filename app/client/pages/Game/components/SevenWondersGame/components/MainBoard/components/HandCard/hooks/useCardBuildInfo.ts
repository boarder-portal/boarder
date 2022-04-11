import { useCallback, useMemo } from 'react';

import {
  ESevenWondersCardActionType,
  ISevenWondersPlayer,
  TSevenWondersAction,
  TSevenWondersBuildType,
  TSevenWondersPayments,
} from 'common/types/sevenWonders';
import { IOwnerResource } from 'client/pages/Game/components/SevenWondersGame/components/MainBoard/types';
import {
  EBuildType,
  IBuildInfo,
} from 'client/pages/Game/components/SevenWondersGame/components/MainBoard/components/HandCard/types';
import { ESevenWonderCardId, ISevenWondersCard } from 'common/types/sevenWonders/cards';

import getTradeVariants
  from 'client/pages/Game/components/SevenWondersGame/components/MainBoard/utilities/getTradeVariants';
import {
  TResourceTradePrices,
} from 'client/pages/Game/components/SevenWondersGame/components/MainBoard/utilities/getResourceTradePrices';
import getCardBuildType
  from 'client/pages/Game/components/SevenWondersGame/components/MainBoard/components/HandCard/utilities/getCardBuildType';

function getTitle(buildType: EBuildType): string {
  switch (buildType) {
    case EBuildType.FREE:
    case EBuildType.FREE_BY_BUILDING:
    case EBuildType.FREE_BY_OWN_RESOURCES:
    case EBuildType.FREE_WITH_EFFECT:
    case EBuildType.OWN_RESOURCES_AND_COINS: {
      return 'Построить';
    }

    case EBuildType.WITH_TRADE: {
      return 'Построить c торговлей';
    }

    case EBuildType.ALREADY_BUILT: {
      return 'Уже построено';
    }

    case EBuildType.NOT_ENOUGH_RESOURCES_OR_COINS:
    case EBuildType.NOT_ALLOWED: {
      return 'Нельзя построить';
    }
  }
}

export default function useCardBuildInfo(
  card: ISevenWondersCard,
  resourcePools: IOwnerResource[][],
  resourceTradePrices: TResourceTradePrices,
  player: ISevenWondersPlayer,
  onCardAction: (cardIndex: number, action: TSevenWondersAction, payments?: TSevenWondersPayments) => void,
  onStartCopyingLeader: (cardIndex: number, action: TSevenWondersAction, payments?: TSevenWondersPayments) => void,
): IBuildInfo {
  const { price: cardPrice } = card;

  const tradeVariants = useMemo(() => getTradeVariants(cardPrice, resourcePools, resourceTradePrices), [cardPrice, resourcePools, resourceTradePrices]);
  const type = useMemo(() => getCardBuildType(card, player, tradeVariants), [card, player, tradeVariants]);

  const title = useMemo(() => getTitle(type), [type]);

  const onBuild = useCallback((cardIndex: number, freeBuildType: TSevenWondersBuildType | null, payments?: TSevenWondersPayments) => {
    if (card.id === ESevenWonderCardId.COURTESANS_GUILD) {
      onStartCopyingLeader(cardIndex, {
        type: ESevenWondersCardActionType.BUILD_STRUCTURE,
        freeBuildType,
      }, payments);

      return;
    }

    onCardAction(cardIndex, {
      type: ESevenWondersCardActionType.BUILD_STRUCTURE,
      freeBuildType,
    }, payments);
  }, [card.id, onCardAction, onStartCopyingLeader]);

  return useMemo(() => ({
    type,
    title,
    tradeVariants,
    onBuild,
  }), [onBuild, title, tradeVariants, type]);
}
