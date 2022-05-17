import { useCallback, useMemo } from 'react';

import {
  ECardActionType,
  EPlayerDirection,
  IAgePlayerData,
  IPlayer,
  ITurnPlayerData,
  TAction,
  TBuildType,
  TPayments,
} from 'common/types/sevenWonders';
import { IOwnerResource } from 'client/pages/Game/components/SevenWondersGame/components/MainBoard/types';
import {
  EBuildType,
  IBuildInfo,
} from 'client/pages/Game/components/SevenWondersGame/components/MainBoard/components/HandCard/types';
import { ECardId, ICard } from 'common/types/sevenWonders/cards';

import getTradeVariants from 'client/pages/Game/components/SevenWondersGame/components/MainBoard/utilities/getTradeVariants';
import { TResourceTradePrices } from 'client/pages/Game/components/SevenWondersGame/components/MainBoard/utilities/getResourceTradePrices';
import getCardBuildType from 'client/pages/Game/components/SevenWondersGame/components/MainBoard/components/HandCard/utilities/getCardBuildType';
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

function getPlayerDiscount(card: ICard, player: IPlayer, direction: EPlayerDirection): number {
  return Math.max(
    ...getAllPlayerEffects(player)
      .filter(isReducedPriceEffect)
      .filter((effect) => effect.objectType === card.type && effect.direction === direction)
      .map((effect) => effect.discount.coins || 0),
    0,
  );
}

function getDiscount(card: ICard, player: IPlayer, leftNeighbor: IPlayer, rightNeighbor: IPlayer): number {
  return Math.max(
    getPlayerDiscount(card, player, EPlayerDirection.SELF),
    getPlayerDiscount(card, leftNeighbor, EPlayerDirection.RIGHT),
    getPlayerDiscount(card, rightNeighbor, EPlayerDirection.LEFT),
  );
}

export default function useCardBuildInfo(
  card: ICard,
  cardIndex: number,
  resourcePools: IOwnerResource[][],
  resourceTradePrices: TResourceTradePrices,
  player: IPlayer,
  agePlayerData: IAgePlayerData | null,
  turnPlayerData: ITurnPlayerData | null,
  leftNeighbor: IPlayer,
  rightNeighbor: IPlayer,
  onCardAction: (action: TAction, payments?: TPayments) => void,
  onStartCopyingLeader: (cardIndex: number, action: TAction, payments?: TPayments) => void,
): IBuildInfo {
  const { price: cardPrice } = card;

  const tradeVariants = useMemo(
    () => getTradeVariants(cardPrice, resourcePools, resourceTradePrices),
    [cardPrice, resourcePools, resourceTradePrices],
  );
  const discount = useMemo(
    () => getDiscount(card, player, leftNeighbor, rightNeighbor),
    [card, leftNeighbor, player, rightNeighbor],
  );
  const type = useMemo(
    () =>
      getCardBuildType(
        card,
        player,
        turnPlayerData?.waitingForAction ?? null,
        agePlayerData?.buildEffects ?? [],
        tradeVariants,
        discount,
      ),
    [agePlayerData, card, discount, player, tradeVariants, turnPlayerData],
  );

  const title = useMemo(() => getTitle(type), [type]);

  const onBuild = useCallback(
    (freeBuildType: TBuildType | null, payments?: TPayments) => {
      if (card.id === ECardId.COURTESANS_GUILD) {
        onStartCopyingLeader(
          cardIndex,
          {
            type: ECardActionType.BUILD_STRUCTURE,
            freeBuildType,
          },
          payments,
        );

        return;
      }

      onCardAction(
        {
          type: ECardActionType.BUILD_STRUCTURE,
          freeBuildType,
          discount,
        },
        payments,
      );
    },
    [card.id, cardIndex, discount, onCardAction, onStartCopyingLeader],
  );

  return useMemo(
    () => ({
      type,
      title,
      tradeVariants,
      onBuild,
    }),
    [onBuild, title, tradeVariants, type],
  );
}
