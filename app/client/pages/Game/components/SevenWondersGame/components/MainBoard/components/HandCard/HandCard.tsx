import React, { useCallback, useMemo, useState } from 'react';
import styled from 'styled-components';
import block from 'bem-cn';

import { ISevenWondersCard } from 'common/types/sevenWonders/cards';
import {
  ESevenWondersGamePhase,
  ISevenWondersPlayer,
  TSevenWondersAction,
  TSevenWondersPayments,
} from 'common/types/sevenWonders';
import {
  EBuildType,
  IBuildInfo,
} from 'client/pages/Game/components/SevenWondersGame/components/MainBoard/components/HandCard/types';
import {
  ISevenWondersCourtesansBuildInfo,
} from 'client/pages/Game/components/SevenWondersGame/components/MainBoard/types';

import getResourceTradePrices, {
} from 'client/pages/Game/components/SevenWondersGame/components/MainBoard/utilities/getResourceTradePrices';
import getPlayerResourcePools
  from 'client/pages/Game/components/SevenWondersGame/components/MainBoard/utilities/getPlayerResourcePools/getPlayerResourcePools';
import getAllPlayerEffects from 'common/utilities/sevenWonders/getAllPlayerEffects';
import { isTradeEffect } from 'common/utilities/sevenWonders/isEffect';
import getCity from 'common/utilities/sevenWonders/getCity';

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
import usePickLeaderInfo
  from 'client/pages/Game/components/SevenWondersGame/components/MainBoard/components/HandCard/hooks/usePickLeaderInfo';
import useWonderLevelBuildInfo
  from 'client/pages/Game/components/SevenWondersGame/components/MainBoard/components/HandCard/hooks/useWonderLevelBuildInfo';
import useSelectGuildToCopyInfo
  from 'client/pages/Game/components/SevenWondersGame/components/MainBoard/components/HandCard/hooks/useSelectGuildToCopyInfo';

import { useBoolean } from 'client/hooks/useBoolean';
import { HOVER_SOUND, playSound } from 'client/sounds';

interface IHandCardProps {
  card: ISevenWondersCard;
  cardIndex: number;
  player: ISevenWondersPlayer;
  gamePhase: ESevenWondersGamePhase;
  leftNeighbor: ISevenWondersPlayer;
  rightNeighbor: ISevenWondersPlayer;
  courtesansBuildInfo: ISevenWondersCourtesansBuildInfo | null;
  isChosen: boolean;
  isDisabled: boolean;
  onCardAction(cardIndex: number, action: TSevenWondersAction, payments?: TSevenWondersPayments): void;
  onCancelCard(): void;
  onStartCopyingLeader(cardIndex: number, action: TSevenWondersAction, payments?: TSevenWondersPayments): void;
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
          z-index: 30;
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
    gamePhase,
    leftNeighbor,
    rightNeighbor,
    courtesansBuildInfo,
    isChosen,
    isDisabled,
    onCardAction,
    onCancelCard,
    onStartCopyingLeader,
  } = props;

  const {
    value: isVisible,
    setTrue: open,
    setFalse: close,
  } = useBoolean(false);

  const [tradeModalType, setTradeModalType] = useState<'card' | 'wonderLevel'>('card');

  const city = useMemo(() => getCity(player.city, player.citySide), [player.city, player.citySide]);

  const resourcePools = useMemo(() => getPlayerResourcePools(player, leftNeighbor, rightNeighbor, card.type), [card, leftNeighbor, player, rightNeighbor]);
  const wonderLevelResourcePools = useMemo(() => getPlayerResourcePools(player, leftNeighbor, rightNeighbor, 'wonderLevel'), [leftNeighbor, player, rightNeighbor]);

  const tradeEffects = useMemo(() => getAllPlayerEffects(player).filter(isTradeEffect), [player]);
  const resourceTradePrices = useMemo(() => getResourceTradePrices(tradeEffects), [tradeEffects]);

  const wonderLevelPrice = useMemo(() => city.wonders[player.builtStages.length]?.price || null, [city.wonders, player.builtStages.length]);
  const wonderLevelBuildInfo = useWonderLevelBuildInfo(wonderLevelPrice, wonderLevelResourcePools, resourceTradePrices, player, onCardAction);

  const selectGuildToCopyInfo = useSelectGuildToCopyInfo(courtesansBuildInfo, onCardAction);
  const pickLeaderInfo = usePickLeaderInfo(gamePhase, onCardAction);
  const cardBuildInfo = useCardBuildInfo(card, resourcePools, resourceTradePrices, player, leftNeighbor, rightNeighbor, onCardAction, onStartCopyingLeader);
  const cardFreeBuildWithEffectInfo = useCardBuildFreeWithEffectInfo(card, player, onCardAction, onStartCopyingLeader);
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

  const isCopyingLeaderActionAvailable = useMemo(() => {
    return Boolean(courtesansBuildInfo);
  }, [courtesansBuildInfo]);

  const isPickLeaderActionAvailable = useMemo(() => {
    return !isChosen && gamePhase === ESevenWondersGamePhase.DRAFT_LEADERS;
  }, [gamePhase, isChosen]);

  const isBuildActionAvailable = useMemo(() => {
    if (isChosen || gamePhase === ESevenWondersGamePhase.DRAFT_LEADERS || isCopyingLeaderActionAvailable) {
      return false;
    }

    if (cardFreeBuildWithEffectInfo.isAvailable) {
      if (!cardFreeBuildWithEffectInfo.isPurchaseAvailable) {
        return cardBuildInfo.type === EBuildType.ALREADY_BUILT;
      }
    }

    return true;
  }, [cardBuildInfo.type, cardFreeBuildWithEffectInfo.isAvailable, cardFreeBuildWithEffectInfo.isPurchaseAvailable, gamePhase, isChosen, isCopyingLeaderActionAvailable]);

  const isBuildFreeWithEffectActionAvailable = useMemo(() => {
    if (
      isChosen ||
      !cardFreeBuildWithEffectInfo.isAvailable ||
      cardBuildInfo.type === EBuildType.ALREADY_BUILT ||
      gamePhase === ESevenWondersGamePhase.DRAFT_LEADERS ||
      isCopyingLeaderActionAvailable
    ) {
      return false;
    }

    if (cardFreeBuildWithEffectInfo.isPurchaseAvailable) {
      if ([EBuildType.FREE, EBuildType.FREE_BY_BUILDING, EBuildType.FREE_BY_OWN_RESOURCES].includes(cardBuildInfo.type)) {
        return false;
      }
    }

    return true;
  }, [cardBuildInfo.type, cardFreeBuildWithEffectInfo.isAvailable, cardFreeBuildWithEffectInfo.isPurchaseAvailable, gamePhase, isChosen, isCopyingLeaderActionAvailable]);

  const isBuildWonderLevelAvailable = useMemo(() => {
    if (isChosen || gamePhase === ESevenWondersGamePhase.DRAFT_LEADERS || isCopyingLeaderActionAvailable) {
      return false;
    }

    return wonderLevelBuildInfo.type !== EBuildType.ALREADY_BUILT && wonderLevelBuildInfo.type !== EBuildType.NOT_ALLOWED;
  }, [gamePhase, isChosen, isCopyingLeaderActionAvailable, wonderLevelBuildInfo.type]);

  const isDiscardActionAvailable = useMemo(() => {
    if (isChosen || gamePhase === ESevenWondersGamePhase.DRAFT_LEADERS || isCopyingLeaderActionAvailable) {
      return false;
    }

    return discardInfo.isAvailable;
  }, [discardInfo.isAvailable, gamePhase, isChosen, isCopyingLeaderActionAvailable]);

  const isCancelActionAvailable = useMemo(() => {
    return isChosen;
  }, [isChosen]);

  const availableTradeVariants = useMemo(() => {
    const tradeVariants = tradeModalType === 'card' ? cardBuildInfo.tradeVariants : wonderLevelBuildInfo.tradeVariants;

    return tradeVariants.filter(({ payments }) => payments.LEFT + payments.RIGHT <= player.coins);
  }, [cardBuildInfo.tradeVariants, player.coins, tradeModalType, wonderLevelBuildInfo.tradeVariants]);

  const handleCardHover = useCallback(() => {
    if (!isDisabled) {
      playSound(HOVER_SOUND);
    }
  }, [isDisabled]);

  return (
    <Root className={b({ isChosen, isDisabled })}>
      <div className={b('cardWrapper')} onMouseEnter={handleCardHover}>
        <Card card={card} width={150} />

        <Box className={b('actions')} flex column between={20} alignItems="center">
          {isCopyingLeaderActionAvailable && <Box size="s" textAlign="center" onClick={selectGuildToCopyInfo.onClick.bind(null, card)}>{selectGuildToCopyInfo.title}</Box>}
          {isPickLeaderActionAvailable && <Box size="s" textAlign="center" onClick={pickLeaderInfo.onClick.bind(null, cardIndex)}>{pickLeaderInfo.title}</Box>}
          {isBuildActionAvailable && <Box size="s" textAlign="center" onClick={getBuildHandler('card', cardBuildInfo)}>{cardBuildInfo.title}</Box>}
          {isBuildFreeWithEffectActionAvailable && <Box size="s" textAlign="center" onClick={cardFreeBuildWithEffectInfo.onBuild.bind(null, cardIndex)}>{cardFreeBuildWithEffectInfo.title}</Box>}
          {isBuildWonderLevelAvailable && <Box size="s" textAlign="center" onClick={getBuildHandler('wonderLevel', wonderLevelBuildInfo)}>{wonderLevelBuildInfo.title}</Box>}
          {isDiscardActionAvailable && <Box size="s" textAlign="center" onClick={discardInfo.onClick.bind(null, cardIndex)}>{discardInfo.title}</Box>}
          {isCancelActionAvailable && <Box size="s" textAlign="center" onClick={onCancelCard}>Отменить</Box>}
        </Box>
      </div>

      <TradeModal
        isVisible={isVisible}
        tradeVariants={availableTradeVariants}
        onBuild={tradeModalType === 'card' ?
          cardBuildInfo.onBuild.bind(null, cardIndex, null) :
          wonderLevelBuildInfo.onBuild.bind(null, cardIndex, null)}
        onClose={close}
      />
    </Root>
  );
};

export default React.memo(HandCard);
