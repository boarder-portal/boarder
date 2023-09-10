import React, { useCallback } from 'react';
import classNames from 'classnames';

import { ICard } from 'common/types/sevenWonders/cards';
import { EGamePhase, IPlayer, TAction, TPayments } from 'common/types/sevenWonders';
import {
  IOwnerResource,
  ISevenWondersCourtesansBuildInfo,
} from 'client/pages/Game/components/SevenWondersGame/components/MainBoard/types';
import { EBuildType } from 'client/pages/Game/components/SevenWondersGame/components/MainBoard/components/HandCard/types';

import { ITradeVariant } from 'client/pages/Game/components/SevenWondersGame/components/MainBoard/components/HandCard/utilities/getTradeVariantsByPurchaseVariants';
import { TResourceTradePrices } from 'client/pages/Game/components/SevenWondersGame/components/MainBoard/utilities/getResourceTradePrices';

import Card from 'client/pages/Game/components/SevenWondersGame/components/Card/Card';
import Actions from 'client/pages/Game/components/SevenWondersGame/components/MainBoard/components/HandCard/components/Actions/Actions';

import { HOVER_SOUND, playSound } from 'client/sounds';

import styles from './HandCard.module.scss';

interface IHandCardProps {
  card: ICard;
  cardIndex: number;
  player: IPlayer;
  gamePhase: EGamePhase | null;
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
    <div
      className={classNames(styles.root, {
        [styles.isChosen]: isChosen,
        [styles.isDisabled]: isDisabled,
      })}
    >
      <div className={styles.cardWrapper} onMouseEnter={handleCardHover}>
        <Card card={card} width={150} />

        {!isViewingLeaders && (
          <Actions
            className={styles.actions}
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
    </div>
  );
};

export default React.memo(HandCard);
