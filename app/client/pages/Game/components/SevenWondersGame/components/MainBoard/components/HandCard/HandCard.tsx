import React, { useCallback, useState } from 'react';
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
  player: ISevenWondersPlayer;
  resourcePools: IOwnerResource[][];
  resourceTradePrices: TResourceTradePrices;
  wonderLevelBuildInfo: IBuildInfo;
  onCardAction(card: ISevenWondersCard, action: TSevenWondersAction, payments?: TSevenWondersPayments): void;
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

      &:hover {
        z-index: 21;

        .HandCard__actions {
          opacity: 1;
          z-index: 22;
        }
      }
    }

    &__actions {
      position: absolute;
      left: 0;
      right: 0;
      bottom: 20px;
      opacity: 0;
      transition: 200ms;

      & > div {
        color: white;
        cursor: pointer;
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
    player,
    resourcePools,
    resourceTradePrices,
    wonderLevelBuildInfo,
    onCardAction,
  } = props;

  const {
    value: isVisible,
    setTrue: open,
    setFalse: close,
  } = useBoolean(false);

  const [tradeModalType, setTradeModalType] = useState<'card' | 'wonderLevel'>('card');

  const cardBuildInfo = useBuildInfo(cardPrice, resourcePools, resourceTradePrices, player);

  const buildCard = useCallback((payments?: TSevenWondersPayments) => {
    onCardAction(card, {
      type: ESevenWondersCardActionType.BUILD_STRUCTURE,
    }, payments);
    close();
  }, [card, close, onCardAction]);

  const buildWonderLevel = useCallback((payments?: TSevenWondersPayments) => {
    onCardAction(card, {
      type: ESevenWondersCardActionType.BUILD_WONDER_STAGE,
      stageIndex: player.buildStages.length,
    }, payments);
    close();
  }, [card, close, onCardAction, player.buildStages.length]);

  const discardCard = useCallback(() => {
    onCardAction(card, {
      type: ESevenWondersCardActionType.DISCARD,
    });
  }, [card, onCardAction]);

  const handleCardBuild = useCallback(() => {
    if (
      cardBuildInfo.type === EBuildType.FREE ||
      cardBuildInfo.type === EBuildType.FOR_BUILDING ||
      cardBuildInfo.type === EBuildType.OWN_RESOURCES_AND_COINS
    ) {
      buildCard();
    } else if (cardBuildInfo.type === EBuildType.WITH_TRADE) {
      setTradeModalType('card');
      open();
    }
  }, [buildCard, cardBuildInfo.type, open]);

  const handleBuildWonderLevel = useCallback(() => {
    if (
      cardBuildInfo.type === EBuildType.FREE ||
      cardBuildInfo.type === EBuildType.OWN_RESOURCES_AND_COINS
    ) {
      buildWonderLevel();
    } else if (cardBuildInfo.type === EBuildType.WITH_TRADE) {
      setTradeModalType('wonderLevel');
      open();
    }
  }, [buildWonderLevel, cardBuildInfo.type, open]);

  return (
    <Root className={b()}>
      <div className={b('cardWrapper')}>
        <Card card={card} />

        <Box className={b('actions')} flex column between={20} alignItems="center">
          <Box size="s" textAlign="center" onClick={handleCardBuild}>{getCardBuildTitle(cardBuildInfo.type)}</Box>
          <Box size="s" textAlign="center" onClick={handleBuildWonderLevel}>{getWonderLevelBuildTitle(wonderLevelBuildInfo.type)}</Box>
          <Box size="s" textAlign="center" onClick={discardCard}>Продать</Box>
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
