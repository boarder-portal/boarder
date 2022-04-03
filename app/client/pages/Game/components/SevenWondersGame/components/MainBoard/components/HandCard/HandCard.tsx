import React, { useCallback, useMemo, useState } from 'react';
import styled from 'styled-components';
import block from 'bem-cn';

import { ISevenWondersCard } from 'common/types/sevenWonders/cards';
import { IOwnerResource } from 'client/pages/Game/components/SevenWondersGame/components/MainBoard/types';
import { ISevenWondersPlayer, TSevenWondersAction, TSevenWondersPayments } from 'common/types/sevenWonders';
import {
  EBuildType,
  IBuildInfo,
} from 'client/pages/Game/components/SevenWondersGame/components/MainBoard/components/HandCard/types';

import {
  TResourceTradePrices,
} from 'client/pages/Game/components/SevenWondersGame/components/MainBoard/utilities/getResourceTradePrices';

import Box from 'client/components/common/Box/Box';
import Card from 'client/pages/Game/components/SevenWondersGame/components/Card/Card';
import TradeModal
  from 'client/pages/Game/components/SevenWondersGame/components/MainBoard/components/HandCard/components/TradeModal/TradeModal';
import useCardBuildInfo
  from 'client/pages/Game/components/SevenWondersGame/components/MainBoard/components/HandCard/hooks/useCardBuildInfo';
import useDiscardInfo
  from 'client/pages/Game/components/SevenWondersGame/components/MainBoard/components/HandCard/hooks/useDiscardInfo';
import useCardBuildFreeWithEffectInfo
  from 'client/pages/Game/components/SevenWondersGame/components/MainBoard/components/HandCard/hooks/useCardBuildFreeWithEffectInfo';

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
    onCardAction,
    onCancelCard,
  } = props;

  const {
    value: isVisible,
    setTrue: open,
    setFalse: close,
  } = useBoolean(false);

  const [tradeModalType, setTradeModalType] = useState<'card' | 'wonderLevel'>('card');

  const cardBuildInfo = useCardBuildInfo(card, resourcePools, resourceTradePrices, player, onCardAction);
  const cardFreeBuildWithEffectInfo = useCardBuildFreeWithEffectInfo(card, player, onCardAction);
  const discardInfo = useDiscardInfo(player, onCardAction);

  const getBuildHandler = useCallback((type: 'card' | 'wonderLevel', buildInfo: IBuildInfo) => {
    return () => {
      if (
        buildInfo.type === EBuildType.FREE ||
        buildInfo.type === EBuildType.FREE_BY_OWN_RESOURCES ||
        buildInfo.type === EBuildType.OWN_RESOURCES_AND_COINS ||
        buildInfo.type === EBuildType.FREE_BY_BUILDING ||
        buildInfo.type === EBuildType.FREE_WITH_EFFECT
      ) {
        buildInfo.onBuild(cardIndex, cardBuildInfo.type === EBuildType.FREE_BY_BUILDING ? {
          type: EBuildType.FREE_BY_BUILDING,
        } : null);
      } else if (buildInfo.type === EBuildType.WITH_TRADE) {
        setTradeModalType(type);
        open();
      }
    };
  }, [cardBuildInfo.type, cardIndex, open]);

  const isBuildActionAvailable = useMemo(() => {
    if (isChosen) {
      return false;
    }

    if (cardFreeBuildWithEffectInfo.isAvailable) {
      if (!cardFreeBuildWithEffectInfo.isPurchaseAvailable) {
        return cardBuildInfo.type === EBuildType.ALREADY_BUILT;
      }
    }

    return true;
  }, [cardBuildInfo.type, cardFreeBuildWithEffectInfo.isAvailable, cardFreeBuildWithEffectInfo.isPurchaseAvailable, isChosen]);

  const isBuildFreeWithEffectActionAvailable = useMemo(() => {
    if (isChosen || !cardFreeBuildWithEffectInfo.isAvailable || cardBuildInfo.type === EBuildType.ALREADY_BUILT) {
      return false;
    }

    if (cardFreeBuildWithEffectInfo.isPurchaseAvailable) {
      if ([EBuildType.FREE, EBuildType.FREE_BY_BUILDING, EBuildType.FREE_BY_OWN_RESOURCES].includes(cardBuildInfo.type)) {
        return false;
      }
    }

    return true;
  }, [cardBuildInfo.type, cardFreeBuildWithEffectInfo, isChosen]);

  const isBuildWonderLevelAvailable = useMemo(() => {
    if (isChosen) {
      return false;
    }

    return wonderLevelBuildInfo.type !== EBuildType.ALREADY_BUILT && wonderLevelBuildInfo.type !== EBuildType.NOT_ALLOWED;
  }, [isChosen, wonderLevelBuildInfo.type]);

  const isDiscardActionAvailable = useMemo(() => {
    if (isChosen) {
      return false;
    }

    return discardInfo.isAvailable;
  }, [discardInfo.isAvailable, isChosen]);

  const isCancelActionAvailable = useMemo(() => {
    return isChosen;
  }, [isChosen]);

  return (
    <Root className={b({ isChosen, isDisabled })}>
      <div className={b('cardWrapper')}>
        <Card card={card} width={150} />

        <Box className={b('actions')} flex column between={20} alignItems="center">
          {isBuildActionAvailable && <Box size="s" textAlign="center" onClick={getBuildHandler('card', cardBuildInfo)}>{cardBuildInfo.title}</Box>}
          {isBuildFreeWithEffectActionAvailable && <Box size="s" textAlign="center" onClick={cardFreeBuildWithEffectInfo.onBuild.bind(null, cardIndex)}>{cardFreeBuildWithEffectInfo.title}</Box>}
          {isBuildWonderLevelAvailable && <Box size="s" textAlign="center" onClick={getBuildHandler('wonderLevel', wonderLevelBuildInfo)}>{wonderLevelBuildInfo.title}</Box>}
          {isDiscardActionAvailable && <Box size="s" textAlign="center" onClick={discardInfo.onClick.bind(null, cardIndex)}>{discardInfo.title}</Box>}
          {isCancelActionAvailable && <Box size="s" textAlign="center" onClick={onCancelCard}>Отменить</Box>}
        </Box>
      </div>

      <TradeModal
        isVisible={isVisible}
        tradeVariants={tradeModalType === 'card' ? cardBuildInfo.tradeVariants : wonderLevelBuildInfo.tradeVariants}
        onBuild={tradeModalType === 'card' ?
          cardBuildInfo.onBuild.bind(null, cardIndex, null) :
          wonderLevelBuildInfo.onBuild.bind(null, cardIndex, null)}
        onClose={close}
      />
    </Root>
  );
};

export default React.memo(HandCard);
