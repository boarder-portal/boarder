import React, { useCallback, useMemo } from 'react';
import styled from 'styled-components';
import block from 'bem-cn';

import {
  EBuildType,
} from 'client/pages/Game/components/SevenWondersGame/components/MainBoard/components/HandCard/types';
import { IPlayer, TAction, TPayments } from 'common/types/sevenWonders';
import { ICard } from 'common/types/sevenWonders/cards';

import getPlayerResourcePools
  from 'client/pages/Game/components/SevenWondersGame/components/MainBoard/utilities/getPlayerResourcePools/getPlayerResourcePools';
import {
  TResourceTradePrices,
} from 'client/pages/Game/components/SevenWondersGame/components/MainBoard/utilities/getResourceTradePrices';

import Box from 'client/components/common/Box/Box';
import useCardBuildInfo
  from 'client/pages/Game/components/SevenWondersGame/components/MainBoard/components/HandCard/hooks/useCardBuildInfo';
import useCardBuildFreeWithEffectInfo
  from 'client/pages/Game/components/SevenWondersGame/components/MainBoard/components/HandCard/hooks/useCardBuildFreeWithEffectInfo';
import TradeModal
  from 'client/pages/Game/components/SevenWondersGame/components/MainBoard/components/HandCard/components/TradeModal/TradeModal';

import { useBoolean } from 'client/hooks/useBoolean';

interface IBuildCardActionsProps {
  card: ICard;
  cardIndex: number;
  player: IPlayer
  leftNeighbor: IPlayer
  rightNeighbor: IPlayer
  resourceTradePrices: TResourceTradePrices;
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
    onCardAction,
    onStartCopyingLeader,
  } = props;

  const {
    value: isTradeModalVisible,
    setTrue: openTradeModal,
    setFalse: closeTradeModal,
  } = useBoolean(false);

  const resourcePools = useMemo(() => getPlayerResourcePools(player, leftNeighbor, rightNeighbor, card.type), [card, leftNeighbor, player, rightNeighbor]);

  const cardBuildInfo = useCardBuildInfo(card, cardIndex, resourcePools, resourceTradePrices, player, leftNeighbor, rightNeighbor, onCardAction, onStartCopyingLeader);
  const cardBuildFreeWithEffectInfo = useCardBuildFreeWithEffectInfo(card, cardIndex, player, onCardAction, onStartCopyingLeader);

  const handleBuildActionClick = useCallback(() => {
    if (
      cardBuildInfo.type === EBuildType.FREE ||
      cardBuildInfo.type === EBuildType.FREE_BY_OWN_RESOURCES ||
      cardBuildInfo.type === EBuildType.OWN_RESOURCES_AND_COINS ||
      cardBuildInfo.type === EBuildType.FREE_BY_BUILDING
    ) {
      cardBuildInfo.onBuild(cardBuildInfo.type === EBuildType.FREE_BY_BUILDING ? {
        type: EBuildType.FREE_BY_BUILDING,
      } : null);
    } else if (cardBuildInfo.type === EBuildType.WITH_TRADE) {
      openTradeModal();
    }
  }, [cardBuildInfo, openTradeModal]);

  const trade = useCallback((payments?: TPayments) => {
    cardBuildInfo.onBuild(null, payments);
  }, [cardBuildInfo]);

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
      if ([EBuildType.FREE, EBuildType.FREE_BY_BUILDING, EBuildType.FREE_BY_OWN_RESOURCES].includes(cardBuildInfo.type)) {
        return false;
      }
    }

    return true;
  }, [cardBuildInfo.type, cardBuildFreeWithEffectInfo.isAvailable, cardBuildFreeWithEffectInfo.isPurchaseAvailable]);

  const availableTradeVariants = useMemo(() => {
    return cardBuildInfo.tradeVariants.filter(({ payments }) => payments.LEFT + payments.RIGHT <= player.coins);
  }, [cardBuildInfo.tradeVariants, player.coins]);

  return (
    <>
      {isBuildActionAvailable && (
        <Box size="s" textAlign="center" onClick={handleBuildActionClick}>
          {cardBuildInfo.title}
        </Box>
      )}

      {isBuildFreeWithEffectActionAvailable && (
        <Box size="s" textAlign="center" onClick={cardBuildFreeWithEffectInfo.onBuild}>
          {cardBuildFreeWithEffectInfo.title}
        </Box>
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
