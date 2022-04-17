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
import { ESevenWonderCardId, ESevenWondersPlayerDirection, ISevenWondersCard } from 'common/types/sevenWonders/cards';

import getTradeVariants
  from 'client/pages/Game/components/SevenWondersGame/components/MainBoard/utilities/getTradeVariants';
import {
  TResourceTradePrices,
} from 'client/pages/Game/components/SevenWondersGame/components/MainBoard/utilities/getResourceTradePrices';
import getCardBuildType
  from 'client/pages/Game/components/SevenWondersGame/components/MainBoard/components/HandCard/utilities/getCardBuildType';
import getAllPlayerEffects from 'common/utilities/sevenWonders/getAllPlayerEffects';
import { isReducedPriceEffect } from 'common/utilities/sevenWonders/isEffect';

function getTitle(buildType: EBuildType): string {
  switch (buildType) {
    case EBuildType.FREE:
    case EBuildType.FREE_BY_BUILDING:
    case EBuildType.FREE_BY_OWN_RESOURCES:
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

    case EBuildType.FREE_WITH_EFFECT: {
      throw new Error('Невозможный вариант');
    }
  }
}

function getPlayerDiscount(card: ISevenWondersCard, player: ISevenWondersPlayer, direction: ESevenWondersPlayerDirection): number {
  return Math.max(
    ...getAllPlayerEffects(player)
      .filter(isReducedPriceEffect)
      .filter((effect) => effect.objectType === card.type && effect.direction === direction)
      .map((effect) => effect.discount.coins || 0),
    0,
  );
}

function getDiscount(card: ISevenWondersCard, player: ISevenWondersPlayer, leftNeighbor: ISevenWondersPlayer, rightNeighbor: ISevenWondersPlayer): number {
  return Math.max(
    getPlayerDiscount(card, player, ESevenWondersPlayerDirection.SELF),
    getPlayerDiscount(card, leftNeighbor, ESevenWondersPlayerDirection.RIGHT),
    getPlayerDiscount(card, rightNeighbor, ESevenWondersPlayerDirection.LEFT),
  );
}

export default function useCardBuildInfo(
  card: ISevenWondersCard,
  cardIndex: number,
  resourcePools: IOwnerResource[][],
  resourceTradePrices: TResourceTradePrices,
  player: ISevenWondersPlayer,
  leftNeighbor: ISevenWondersPlayer,
  rightNeighbor: ISevenWondersPlayer,
  onCardAction: (action: TSevenWondersAction, payments?: TSevenWondersPayments) => void,
  onStartCopyingLeader: (cardIndex: number, action: TSevenWondersAction, payments?: TSevenWondersPayments) => void,
): IBuildInfo {
  const { price: cardPrice } = card;

  const tradeVariants = useMemo(() => getTradeVariants(cardPrice, resourcePools, resourceTradePrices), [cardPrice, resourcePools, resourceTradePrices]);
  const discount = useMemo(() => getDiscount(card, player, leftNeighbor, rightNeighbor), [card, leftNeighbor, player, rightNeighbor]);
  const type = useMemo(() => getCardBuildType(card, player, tradeVariants, discount), [card, discount, player, tradeVariants]);

  const title = useMemo(() => getTitle(type), [type]);

  const onBuild = useCallback((freeBuildType: TSevenWondersBuildType | null, payments?: TSevenWondersPayments) => {
    if (card.id === ESevenWonderCardId.COURTESANS_GUILD) {
      onStartCopyingLeader(cardIndex, {
        type: ESevenWondersCardActionType.BUILD_STRUCTURE,
        freeBuildType,
      }, payments);

      return;
    }

    onCardAction({
      type: ESevenWondersCardActionType.BUILD_STRUCTURE,
      freeBuildType,
      discount,
    }, payments);
  }, [card.id, cardIndex, discount, onCardAction, onStartCopyingLeader]);

  return useMemo(() => ({
    type,
    title,
    tradeVariants,
    onBuild,
  }), [onBuild, title, tradeVariants, type]);
}
