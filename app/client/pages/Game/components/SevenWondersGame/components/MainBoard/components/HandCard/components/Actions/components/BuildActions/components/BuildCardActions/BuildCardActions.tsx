import React, { useCallback, useMemo } from 'react';

import { BuildKind } from 'client/pages/Game/components/SevenWondersGame/components/MainBoard/components/HandCard/types';
import { OwnerResource } from 'client/pages/Game/components/SevenWondersGame/components/MainBoard/types';
import { Action, Payments, Player } from 'common/types/sevenWonders';
import { Card } from 'common/types/sevenWonders/cards';

import getObjectSpecificResources from 'client/pages/Game/components/SevenWondersGame/components/MainBoard/utilities/getPlayerResourcePools/utilities/getObjectSpecificResources';
import getResourcePoolsWithAdditionalResources from 'client/pages/Game/components/SevenWondersGame/components/MainBoard/utilities/getResourcePoolsWithAdditionalResources';
import { ResourceTradePrices } from 'client/pages/Game/components/SevenWondersGame/components/MainBoard/utilities/getResourceTradePrices';

import useBoolean from 'client/hooks/useBoolean';
import useCardBuildFreeWithEffectInfo from 'client/pages/Game/components/SevenWondersGame/components/MainBoard/components/HandCard/hooks/useCardBuildFreeWithEffectInfo';
import useCardBuildInfo from 'client/pages/Game/components/SevenWondersGame/components/MainBoard/components/HandCard/hooks/useCardBuildInfo';

import Text from 'client/components/common/Text/Text';
import TradeModal from 'client/pages/Game/components/SevenWondersGame/components/MainBoard/components/HandCard/components/TradeModal/TradeModal';

import styles from './BuildCardActions.module.scss';

interface BuildCardActionsProps {
  card: Card;
  cardIndex: number;
  player: Player;
  leftNeighbor: Player;
  rightNeighbor: Player;
  resourceTradePrices: ResourceTradePrices;
  resourcePools: OwnerResource[][];
  onCardAction(action: Action, payments?: Payments): void;
  onStartCopyingLeader(cardIndex: number, action: Action, payments?: Payments): void;
}

const BuildCardActions: React.FC<BuildCardActionsProps> = (props) => {
  const {
    card,
    cardIndex,
    player,
    leftNeighbor,
    rightNeighbor,
    resourceTradePrices,
    resourcePools,
    onCardAction,
    onStartCopyingLeader,
  } = props;

  const { value: isTradeModalVisible, setTrue: openTradeModal, setFalse: closeTradeModal } = useBoolean(false);

  const cardResourcePools = useMemo(() => {
    const objectSpecificResources = getObjectSpecificResources(player, card.type);

    return getResourcePoolsWithAdditionalResources(resourcePools, objectSpecificResources);
  }, [card.type, player, resourcePools]);

  const cardBuildInfo = useCardBuildInfo(
    card,
    cardIndex,
    cardResourcePools,
    resourceTradePrices,
    player,
    leftNeighbor,
    rightNeighbor,
    onCardAction,
    onStartCopyingLeader,
  );
  const cardBuildFreeWithEffectInfo = useCardBuildFreeWithEffectInfo(
    card,
    cardIndex,
    player,
    onCardAction,
    onStartCopyingLeader,
  );

  const handleBuildActionClick = useCallback(() => {
    if (
      cardBuildInfo.type === BuildKind.FREE ||
      cardBuildInfo.type === BuildKind.FREE_BY_OWN_RESOURCES ||
      cardBuildInfo.type === BuildKind.OWN_RESOURCES_AND_COINS ||
      cardBuildInfo.type === BuildKind.FREE_BY_BUILDING
    ) {
      cardBuildInfo.onBuild(
        cardBuildInfo.type === BuildKind.FREE_BY_BUILDING
          ? {
              type: BuildKind.FREE_BY_BUILDING,
            }
          : null,
      );
    } else if (cardBuildInfo.type === BuildKind.WITH_TRADE) {
      openTradeModal();
    }
  }, [cardBuildInfo, openTradeModal]);

  const trade = useCallback(
    (payments?: Payments) => {
      cardBuildInfo.onBuild(null, payments);
    },
    [cardBuildInfo],
  );

  const isBuildActionAvailable = useMemo(() => {
    if (cardBuildFreeWithEffectInfo.isAvailable && !cardBuildFreeWithEffectInfo.isPurchaseAvailable) {
      return cardBuildInfo.type === BuildKind.ALREADY_BUILT;
    }

    return true;
  }, [cardBuildInfo.type, cardBuildFreeWithEffectInfo.isAvailable, cardBuildFreeWithEffectInfo.isPurchaseAvailable]);

  const isBuildFreeWithEffectActionAvailable = useMemo(() => {
    if (!cardBuildFreeWithEffectInfo.isAvailable || cardBuildInfo.type === BuildKind.ALREADY_BUILT) {
      return false;
    }

    if (cardBuildFreeWithEffectInfo.isPurchaseAvailable) {
      if ([BuildKind.FREE, BuildKind.FREE_BY_BUILDING, BuildKind.FREE_BY_OWN_RESOURCES].includes(cardBuildInfo.type)) {
        return false;
      }
    }

    return true;
  }, [cardBuildInfo.type, cardBuildFreeWithEffectInfo.isAvailable, cardBuildFreeWithEffectInfo.isPurchaseAvailable]);

  const availableTradeVariants = useMemo(() => {
    return cardBuildInfo.tradeVariants.filter(({ payments }) => payments.LEFT + payments.RIGHT <= player.data.coins);
  }, [cardBuildInfo.tradeVariants, player.data.coins]);

  return (
    <>
      {isBuildActionAvailable && (
        <Text className={styles.action} size="s" onClick={handleBuildActionClick}>
          {cardBuildInfo.title}
        </Text>
      )}

      {isBuildFreeWithEffectActionAvailable && (
        <Text className={styles.action} size="s" onClick={cardBuildFreeWithEffectInfo.onBuild}>
          {cardBuildFreeWithEffectInfo.title}
        </Text>
      )}

      <TradeModal
        isVisible={isTradeModalVisible}
        tradeVariants={availableTradeVariants}
        onBuild={trade}
        onClose={closeTradeModal}
      />
    </>
  );
};

export default React.memo(BuildCardActions);
