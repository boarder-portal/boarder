import { useCallback, useMemo } from 'react';

import {
  BuildInfo,
  BuildKind,
} from 'client/components/games/sevenWonders/SevenWondersGame/components/MainBoard/components/HandCard/types';
import { OwnerResource } from 'client/components/games/sevenWonders/SevenWondersGame/components/MainBoard/types';
import { Action, BuildType, CardActionType, Payments, Player, PlayerDirection } from 'common/types/games/sevenWonders';
import { Card, CardId } from 'common/types/games/sevenWonders/cards';

import getCardBuildType from 'client/components/games/sevenWonders/SevenWondersGame/components/MainBoard/components/HandCard/utilities/getCardBuildType';
import { ResourceTradePrices } from 'client/components/games/sevenWonders/SevenWondersGame/components/MainBoard/utilities/getResourceTradePrices';
import getTradeVariants from 'client/components/games/sevenWonders/SevenWondersGame/components/MainBoard/utilities/getTradeVariants';
import getAllPlayerEffects from 'common/utilities/games/sevenWonders/getAllPlayerEffects';
import { isReducedPriceEffect } from 'common/utilities/games/sevenWonders/isEffect';

function getTitle(buildType: BuildKind): string {
  switch (buildType) {
    case BuildKind.FREE:
    case BuildKind.FREE_BY_BUILDING:
    case BuildKind.FREE_BY_OWN_RESOURCES:
    case BuildKind.OWN_RESOURCES_AND_COINS: {
      return 'Построить';
    }

    case BuildKind.WITH_TRADE: {
      return 'Построить c торговлей';
    }

    case BuildKind.ALREADY_BUILT: {
      return 'Уже построено';
    }

    case BuildKind.NOT_ENOUGH_RESOURCES_OR_COINS:
    case BuildKind.NOT_ALLOWED: {
      return 'Нельзя построить';
    }

    case BuildKind.FREE_WITH_EFFECT: {
      throw new Error('Невозможный вариант');
    }
  }
}

function getPlayerDiscount(card: Card, player: Player, direction: PlayerDirection): number {
  return Math.max(
    ...getAllPlayerEffects(player.data)
      .filter(isReducedPriceEffect)
      .filter((effect) => effect.objectType === card.type && effect.direction === direction)
      .map((effect) => effect.discount.coins ?? 0),
    0,
  );
}

function getDiscount(card: Card, player: Player, leftNeighbor: Player, rightNeighbor: Player): number {
  return Math.max(
    getPlayerDiscount(card, player, PlayerDirection.SELF),
    getPlayerDiscount(card, leftNeighbor, PlayerDirection.RIGHT),
    getPlayerDiscount(card, rightNeighbor, PlayerDirection.LEFT),
  );
}

export default function useCardBuildInfo(
  card: Card,
  cardIndex: number,
  resourcePools: OwnerResource[][],
  resourceTradePrices: ResourceTradePrices,
  player: Player,
  leftNeighbor: Player,
  rightNeighbor: Player,
  onCardAction: (action: Action, payments?: Payments) => void,
  onStartCopyingLeader: (cardIndex: number, action: Action, payments?: Payments) => void,
): BuildInfo {
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
    () => getCardBuildType(card, player, tradeVariants, discount),
    [card, discount, player, tradeVariants],
  );

  const title = useMemo(() => getTitle(type), [type]);

  const onBuild = useCallback(
    (freeBuildType: BuildType | null, payments?: Payments) => {
      if (card.id === CardId.COURTESANS_GUILD) {
        onStartCopyingLeader(
          cardIndex,
          {
            type: CardActionType.BUILD_STRUCTURE,
            freeBuildType,
          },
          payments,
        );

        return;
      }

      onCardAction(
        {
          type: CardActionType.BUILD_STRUCTURE,
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
