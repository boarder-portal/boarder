import React, { useCallback, useMemo } from 'react';

import { EBuildType } from 'client/pages/Game/components/SevenWondersGame/components/MainBoard/components/HandCard/types';
import { IPlayer, TAction, TPayments } from 'common/types/sevenWonders';
import { ICard } from 'common/types/sevenWonders/cards';
import { IOwnerResource } from 'client/pages/Game/components/SevenWondersGame/components/MainBoard/types';

import { TResourceTradePrices } from 'client/pages/Game/components/SevenWondersGame/components/MainBoard/utilities/getResourceTradePrices';
import getObjectSpecificResources from 'client/pages/Game/components/SevenWondersGame/components/MainBoard/utilities/getPlayerResourcePools/utilities/getObjectSpecificResources';
import getResourcePoolsWithAdditionalResources from 'client/pages/Game/components/SevenWondersGame/components/MainBoard/utilities/getResourcePoolsWithAdditionalResources';

import useCardBuildInfo from 'client/pages/Game/components/SevenWondersGame/components/MainBoard/components/HandCard/hooks/useCardBuildInfo';
import useCardBuildFreeWithEffectInfo from 'client/pages/Game/components/SevenWondersGame/components/MainBoard/components/HandCard/hooks/useCardBuildFreeWithEffectInfo';
import { useBoolean } from 'client/hooks/useBoolean';

import TradeModal from 'client/pages/Game/components/SevenWondersGame/components/MainBoard/components/HandCard/components/TradeModal/TradeModal';
import Text from 'client/components/common/Text/Text';

import styles from './BuildCardActions.pcss';

interface IBuildCardActionsProps {
  card: ICard;
  cardIndex: number;
  player: IPlayer;
  leftNeighbor: IPlayer;
  rightNeighbor: IPlayer;
  resourceTradePrices: TResourceTradePrices;
  resourcePools: IOwnerResource[][];
  onCardAction(action: TAction, payments?: TPayments): void;
  onStartCopyingLeader(cardIndex: number, action: TAction, payments?: TPayments): void;
}

const BuildCardActions: React.FC<IBuildCardActionsProps> = (props) => {
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
      cardBuildInfo.type === EBuildType.FREE ||
      cardBuildInfo.type === EBuildType.FREE_BY_OWN_RESOURCES ||
      cardBuildInfo.type === EBuildType.OWN_RESOURCES_AND_COINS ||
      cardBuildInfo.type === EBuildType.FREE_BY_BUILDING
    ) {
      cardBuildInfo.onBuild(
        cardBuildInfo.type === EBuildType.FREE_BY_BUILDING
          ? {
              type: EBuildType.FREE_BY_BUILDING,
            }
          : null,
      );
    } else if (cardBuildInfo.type === EBuildType.WITH_TRADE) {
      openTradeModal();
    }
  }, [cardBuildInfo, openTradeModal]);

  const trade = useCallback(
    (payments?: TPayments) => {
      cardBuildInfo.onBuild(null, payments);
    },
    [cardBuildInfo],
  );

  const isBuildActionAvailable = useMemo(() => {
    if (cardBuildFreeWithEffectInfo.isAvailable && !cardBuildFreeWithEffectInfo.isPurchaseAvailable) {
      return cardBuildInfo.type === EBuildType.ALREADY_BUILT;
    }

    return true;
  }, [cardBuildInfo.type, cardBuildFreeWithEffectInfo.isAvailable, cardBuildFreeWithEffectInfo.isPurchaseAvailable]);

  const isBuildFreeWithEffectActionAvailable = useMemo(() => {
    if (!cardBuildFreeWithEffectInfo.isAvailable || cardBuildInfo.type === EBuildType.ALREADY_BUILT) {
      return false;
    }

    if (cardBuildFreeWithEffectInfo.isPurchaseAvailable) {
      if (
        [EBuildType.FREE, EBuildType.FREE_BY_BUILDING, EBuildType.FREE_BY_OWN_RESOURCES].includes(cardBuildInfo.type)
      ) {
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
