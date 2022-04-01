import React, { useCallback, useMemo, useState } from 'react';
import styled from 'styled-components';
import block from 'bem-cn';

import { ISevenWondersCard } from 'common/types/sevenWonders/cards';
import { IOwnerResource } from 'client/pages/Game/components/SevenWondersGame/components/MainBoard/types';
import {
  ESevenWondersCardActionType,
  ISevenWondersPlayer,
  TSevenWondersAction,
  TSevenWondersPayments,
} from 'common/types/sevenWonders';

import {
  TResourceTradePrices,
} from 'client/pages/Game/components/SevenWondersGame/components/MainBoard/utilities/getResourceTradePrices';
import getCardBuildTitle
  from 'client/pages/Game/components/SevenWondersGame/components/MainBoard/components/HandCard/utilities/getCardBuildTitle';
import getWonderLevelBuildTitle
  from 'client/pages/Game/components/SevenWondersGame/components/MainBoard/components/HandCard/utilities/getWonderLevelBuildTitle';

import Box from 'client/components/common/Box/Box';
import Card from 'client/pages/Game/components/SevenWondersGame/components/Card/Card';
import TradeModal
  from 'client/pages/Game/components/SevenWondersGame/components/MainBoard/components/HandCard/components/TradeModal/TradeModal';
import useBuildInfo
, {
  IBuildInfo,
} from 'client/pages/Game/components/SevenWondersGame/components/MainBoard/components/HandCard/hooks/useBuildInfo';

import { useBoolean } from 'client/hooks/useBoolean';

interface IHandCardProps {
  card: ISevenWondersCard;
  cardIndex: number;
  player: ISevenWondersPlayer;
  resourcePools: IOwnerResource[][];
  resourceTradePrices: TResourceTradePrices;
  wonderLevelBuildInfo: IBuildInfo;
  isChosen: boolean;
  isDisabled: boolean;
  onCardAction(card: ISevenWondersCard, cardIndex: number, action: TSevenWondersAction, payments?: TSevenWondersPayments): void;
  onCancelCard(): void;
}

export enum EBuildType {
  FREE = 'FREE',
  FOR_BUILDING = 'FOR_BUILDING',
  OWN_RESOURCES_AND_COINS = 'OWN_RESOURCES_AND_COINS',
  WITH_TRADE = 'WITH_TRADE',
  NOT_AVAILABLE = 'NOT_AVAILABLE',
  ALREADY_BUILT = 'ALREADY_BUILT',
}

const b = block('HandCard');

const Root = styled(Box)`

  .HandCard {
    &__cardWrapper {
      position: relative;
    }

    &__actions {
      position: absolute;
      left: 0;
      right: 0;
      bottom: 20px;
      opacity: 0;
      pointer-events: none;
      transition: 200ms;

      & > div {
        color: white;
        cursor: pointer;
        text-shadow: 1px 1px 2px black;
      }
    }
  }

  &.HandCard {
    &_isChosen {
      box-shadow: green 0 5px 15px;
      z-index: 22;
    }

    &_isDisabled {
      position: relative;

      &::after {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(220, 220, 220, 0.6);
      }
    }
  }

  :not(.HandCard_isDisabled) {
    .HandCard__cardWrapper {
      &:hover {
        z-index: 21;

        .HandCard__actions {
          opacity: 1;
          pointer-events: all;
          z-index: 22;
        }
      }
    }
  }
`;

const HandCard: React.FC<IHandCardProps> = (props) => {
  const {
    card,
    card: {
      price: cardPrice,
    },
    cardIndex,
    player,
    resourcePools,
    resourceTradePrices,
    wonderLevelBuildInfo,
    isChosen,
    isDisabled,
    onCardAction,
    onCancelCard,
  } = props;

  const {
    value: isVisible,
    setTrue: open,
    setFalse: close,
  } = useBoolean(false);

  const [tradeModalType, setTradeModalType] = useState<'card' | 'wonderLevel'>('card');

  const cardBuildInfo = useBuildInfo(cardPrice, resourcePools, resourceTradePrices, player);

  const buildCard = useCallback((payments: TSevenWondersPayments | undefined, isFree: boolean) => {
    onCardAction(card, cardIndex, {
      type: ESevenWondersCardActionType.BUILD_STRUCTURE,
      isFree,
    }, payments);
    close();
  }, [card, cardIndex, close, onCardAction]);

  const buildWonderLevel = useCallback((payments?: TSevenWondersPayments) => {
    onCardAction(card, cardIndex, {
      type: ESevenWondersCardActionType.BUILD_WONDER_STAGE,
      stageIndex: player.builtStages.length,
    }, payments);
    close();
  }, [card, cardIndex, close, onCardAction, player.builtStages.length]);

  const discardCard = useCallback(() => {
    onCardAction(card, cardIndex, {
      type: ESevenWondersCardActionType.DISCARD,
    });
  }, [card, cardIndex, onCardAction]);

  const handleCardBuild = useCallback(() => {
    if (
      cardBuildInfo.type === EBuildType.FREE ||
      cardBuildInfo.type === EBuildType.FOR_BUILDING ||
      cardBuildInfo.type === EBuildType.OWN_RESOURCES_AND_COINS
    ) {
      buildCard(undefined, cardBuildInfo.type === EBuildType.FREE || cardBuildInfo.type === EBuildType.FOR_BUILDING);
    } else if (cardBuildInfo.type === EBuildType.WITH_TRADE) {
      setTradeModalType('card');
      open();
    }
  }, [buildCard, cardBuildInfo.type, open]);

  const handleBuildWonderLevel = useCallback(() => {
    if (
      wonderLevelBuildInfo.type === EBuildType.FREE ||
      wonderLevelBuildInfo.type === EBuildType.OWN_RESOURCES_AND_COINS
    ) {
      buildWonderLevel();
    } else if (wonderLevelBuildInfo.type === EBuildType.WITH_TRADE) {
      setTradeModalType('wonderLevel');
      open();
    }
  }, [buildWonderLevel, open, wonderLevelBuildInfo.type]);

  const actions = useMemo(() => {
    if (isChosen) {
      return (
        <Box size="s" textAlign="center" onClick={onCancelCard}>Отменить</Box>
      );
    }

    return (
      <>
        <Box size="s" textAlign="center" onClick={handleCardBuild}>{getCardBuildTitle(cardBuildInfo.type)}</Box>
        <Box size="s" textAlign="center" onClick={handleBuildWonderLevel}>{getWonderLevelBuildTitle(wonderLevelBuildInfo.type)}</Box>
        <Box size="s" textAlign="center" onClick={discardCard}>Продать</Box>
      </>
    );
  }, [cardBuildInfo.type, discardCard, handleBuildWonderLevel, handleCardBuild, isChosen, onCancelCard, wonderLevelBuildInfo.type]);

  return (
    <Root className={b({ isChosen, isDisabled })}>
      <div className={b('cardWrapper')}>
        <Card card={card} />

        <Box className={b('actions')} flex column between={20} alignItems="center">
          {actions}
        </Box>
      </div>

      <TradeModal
        isVisible={isVisible}
        tradeVariants={tradeModalType === 'card' ? cardBuildInfo.tradeVariants : wonderLevelBuildInfo.tradeVariants}
        onBuild={tradeModalType === 'card' ? buildCard : buildWonderLevel}
        onClose={close}
      />
    </Root>
  );
};

export default React.memo(HandCard);
