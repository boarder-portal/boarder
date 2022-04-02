import React, { useCallback, useMemo, useState } from 'react';
import styled from 'styled-components';
import block from 'bem-cn';

import { ISevenWondersCard } from 'common/types/sevenWonders/cards';
import { IOwnerResource } from 'client/pages/Game/components/SevenWondersGame/components/MainBoard/types';
import {
  ESevenWondersCardActionType,
  ISevenWondersPlayer,
  TSevenWondersAction,
  TSevenWondersBuildType,
  TSevenWondersPayments,
} from 'common/types/sevenWonders';
import { ESevenWondersFreeCardPeriod, ISevenWondersBuildCardEffect } from 'common/types/sevenWonders/effects';
import {
  EBuildType,
  IBuildInfo,
} from 'client/pages/Game/components/SevenWondersGame/components/MainBoard/components/HandCard/types';

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
import useCardBuildInfo
  from 'client/pages/Game/components/SevenWondersGame/components/MainBoard/components/HandCard/hooks/useCardBuildInfo';

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
  waitingBuildEffect: ISevenWondersBuildCardEffect | null;
  onCardAction(cardIndex: number, action: TSevenWondersAction, payments?: TSevenWondersPayments): void;
  onCancelCard(): void;
}

const b = block('HandCard');

const Root = styled(Box)`
  .HandCard {
    &__cardWrapper {
      transition: 200ms;
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
      .HandCard__cardWrapper {
        box-shadow: green 0 5px 15px;
        z-index: 22;
      }
    }

    &_isDisabled {
      .HandCard__cardWrapper {
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
  }

  :not(.HandCard_isDisabled) {
    .HandCard__cardWrapper {
      &:hover {
        transform: translateY(-100px);
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
    cardIndex,
    player,
    resourcePools,
    resourceTradePrices,
    wonderLevelBuildInfo,
    isChosen,
    isDisabled,
    waitingBuildEffect,
    onCardAction,
    onCancelCard,
  } = props;

  const {
    value: isVisible,
    setTrue: open,
    setFalse: close,
  } = useBoolean(false);

  const [tradeModalType, setTradeModalType] = useState<'card' | 'wonderLevel'>('card');

  const cardBuildInfo = useCardBuildInfo(card, resourcePools, resourceTradePrices, player);

  const buildEffectIndex = useMemo(() => {
    if (
      cardBuildInfo.type === EBuildType.FREE ||
      cardBuildInfo.type === EBuildType.FOR_BUILDING ||
      cardBuildInfo.type === EBuildType.ALREADY_BUILT ||
      cardBuildInfo.type === EBuildType.OWN_RESOURCES
    ) {
      return -1;
    }

    const ageBuildCardEffects = player.buildCardEffects.filter((effect) => effect.period === ESevenWondersFreeCardPeriod.AGE);

    return ageBuildCardEffects.findIndex((effect) =>
      effect.cardTypes?.includes(card.type) ?? true,
    );
  }, [card.type, cardBuildInfo.type, player.buildCardEffects]);

  const buildCard = useCallback((payments: TSevenWondersPayments | undefined, freeBuildType?: TSevenWondersBuildType | null) => {
    onCardAction(cardIndex, {
      type: ESevenWondersCardActionType.BUILD_STRUCTURE,
      freeBuildType: freeBuildType || null,
    }, payments);
    close();
  }, [cardIndex, close, onCardAction]);

  const buildWonderLevel = useCallback((payments?: TSevenWondersPayments) => {
    onCardAction(cardIndex, {
      type: ESevenWondersCardActionType.BUILD_WONDER_STAGE,
      stageIndex: player.builtStages.length,
    }, payments);
    close();
  }, [cardIndex, close, onCardAction, player.builtStages.length]);

  const discardCard = useCallback(() => {
    onCardAction(cardIndex, {
      type: ESevenWondersCardActionType.DISCARD,
    });
  }, [cardIndex, onCardAction]);

  const handleBuildCardWithEffect = useCallback(() => {
    onCardAction(cardIndex, {
      type: ESevenWondersCardActionType.BUILD_STRUCTURE,
      freeBuildType: {
        type: EBuildType.FREE_WITH_EFFECT,
        effectIndex: buildEffectIndex,
      },
    });
  }, [buildEffectIndex, cardIndex, onCardAction]);

  const handleCardBuild = useCallback(() => {
    if (waitingBuildEffect?.isFree) {
      buildCard(undefined);

      return;
    }

    if (
      cardBuildInfo.type === EBuildType.FREE ||
      cardBuildInfo.type === EBuildType.FOR_BUILDING ||
      cardBuildInfo.type === EBuildType.OWN_RESOURCES ||
      cardBuildInfo.type === EBuildType.OWN_RESOURCES_AND_COINS
    ) {
      buildCard(undefined, cardBuildInfo.type === EBuildType.FOR_BUILDING ? {
        type: EBuildType.FOR_BUILDING,
      } : null);
    } else if (cardBuildInfo.type === EBuildType.WITH_TRADE) {
      setTradeModalType('card');
      open();
    }
  }, [buildCard, cardBuildInfo.type, open, waitingBuildEffect]);

  const handleBuildWonderLevel = useCallback(() => {
    if (
      wonderLevelBuildInfo.type === EBuildType.FREE ||
      wonderLevelBuildInfo.type === EBuildType.OWN_RESOURCES ||
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

    const possibleActions = waitingBuildEffect?.possibleActions ?? Object.values(ESevenWondersCardActionType);

    const buildActionAvailable = possibleActions.includes(ESevenWondersCardActionType.BUILD_STRUCTURE);
    const buildWonderLevelAvailable = possibleActions.includes(ESevenWondersCardActionType.BUILD_WONDER_STAGE);
    const discardAvailable = possibleActions.includes(ESevenWondersCardActionType.DISCARD);

    return (
      <>
        {buildActionAvailable && <Box size="s" textAlign="center" onClick={handleCardBuild}>{getCardBuildTitle(cardBuildInfo.type, waitingBuildEffect)}</Box>}
        {!waitingBuildEffect?.isFree && buildActionAvailable && buildEffectIndex !== -1 && (
          <Box size="s" textAlign="center" onClick={handleBuildCardWithEffect}>Построить бесплатно с эффектом</Box>
        )}
        {buildWonderLevelAvailable && <Box size="s" textAlign="center" onClick={handleBuildWonderLevel}>{getWonderLevelBuildTitle(wonderLevelBuildInfo.type)}</Box>}
        {discardAvailable && <Box size="s" textAlign="center" onClick={discardCard}>Продать</Box>}
      </>
    );
  }, [buildEffectIndex, cardBuildInfo.type, discardCard, handleBuildCardWithEffect, handleBuildWonderLevel, handleCardBuild, isChosen, onCancelCard, waitingBuildEffect, wonderLevelBuildInfo.type]);

  return (
    <Root className={b({ isChosen, isDisabled })}>
      <div className={b('cardWrapper')}>
        <Card card={card} width={150} />

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
