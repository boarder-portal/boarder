import React, { useCallback } from 'react';
import styled from 'styled-components';
import block from 'bem-cn';

import { ICard } from 'common/types/sevenWonders/cards';
import {
  EGamePhase,
  IPlayer,
  TAction,
  TPayments,
} from 'common/types/sevenWonders';
import {
  IOwnerResource,
  ISevenWondersCourtesansBuildInfo,
} from 'client/pages/Game/components/SevenWondersGame/components/MainBoard/types';
import {
  EBuildType,
} from 'client/pages/Game/components/SevenWondersGame/components/MainBoard/components/HandCard/types';

import {
  ITradeVariant,
} from 'client/pages/Game/components/SevenWondersGame/components/MainBoard/components/HandCard/utilities/getTradeVariantsByPurchaseVariants';
import {
  TResourceTradePrices,
} from 'client/pages/Game/components/SevenWondersGame/components/MainBoard/utilities/getResourceTradePrices';

import Box from 'client/components/common/Box/Box';
import Card from 'client/pages/Game/components/SevenWondersGame/components/Card/Card';
import Actions
  from 'client/pages/Game/components/SevenWondersGame/components/MainBoard/components/HandCard/components/Actions/Actions';

import { HOVER_SOUND, playSound } from 'client/sounds';

interface IHandCardProps {
  card: ICard;
  cardIndex: number;
  player: IPlayer;
  gamePhase: EGamePhase;
  leftNeighbor: IPlayer;
  rightNeighbor: IPlayer;
  courtesansBuildInfo: ISevenWondersCourtesansBuildInfo | null;
  isChosen: boolean;
  isDisabled: boolean;
  isViewingLeaders: boolean;
  resourceTradePrices: TResourceTradePrices;
  resourcePools: IOwnerResource[][];
  wonderLevelBuildType: EBuildType;
  wonderLevelTradeVariants: ITradeVariant[];
  onCardAction(cardIndex: number, action: TAction, payments?: TPayments): void;
  onCancelCard(): void;
  onStartCopyingLeader(cardIndex: number, action: TAction, payments?: TPayments): void;
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
      color: white;
      cursor: pointer;
      text-shadow: 1px 1px 2px black;

      & > div {
        color: white;
        font-size: 14px;
        text-align: center;
        cursor: pointer;
        text-shadow: 1px 1px 2px black;

        &:not(:first-child) {
          margin-top: 20px;
        }
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
        z-index: 21;

        .HandCard__actions {
          opacity: 1;
          pointer-events: all;
          z-index: 30;
          user-select: none;
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
    isViewingLeaders,
    resourceTradePrices,
    resourcePools,
    wonderLevelBuildType,
    wonderLevelTradeVariants,
    onCardAction,
    onCancelCard,
    onStartCopyingLeader,
  } = props;

  const handleCardHover = useCallback(() => {
    if (!isDisabled) {
      playSound(HOVER_SOUND);
    }
  }, [isDisabled]);

  return (
    <Root className={b({ isChosen, isDisabled })}>
      <div className={b('cardWrapper')} onMouseEnter={handleCardHover}>
        <Card card={card} width={150} />

        {!isViewingLeaders && (
          <Actions
            className={b('actions')}
            cardIndex={cardIndex}
            card={card}
            player={player}
            leftNeighbor={leftNeighbor}
            rightNeighbor={rightNeighbor}
            isChosen={isChosen}
            gamePhase={gamePhase}
            courtesansBuildInfo={courtesansBuildInfo}
            resourceTradePrices={resourceTradePrices}
            resourcePools={resourcePools}
            wonderLevelBuildType={wonderLevelBuildType}
            wonderLevelTradeVariants={wonderLevelTradeVariants}
            onCancelCard={onCancelCard}
            onCardAction={onCardAction}
            onStartCopyingLeader={onStartCopyingLeader}
          />
        )}
      </div>
    </Root>
  );
};

export default React.memo(HandCard);
