import classNames from 'classnames';
import React, { useCallback } from 'react';

import { BuildKind } from 'client/pages/Game/components/SevenWondersGame/components/MainBoard/components/HandCard/types';
import {
  CourtesansBuildInfo,
  OwnerResource,
} from 'client/pages/Game/components/SevenWondersGame/components/MainBoard/types';
import { Action, GamePhaseType, Payments, Player } from 'common/types/games/sevenWonders';
import { Card as CardModel } from 'common/types/games/sevenWonders/cards';

import { TradeVariant } from 'client/pages/Game/components/SevenWondersGame/components/MainBoard/components/HandCard/utilities/getTradeVariantsByPurchaseVariants';
import { ResourceTradePrices } from 'client/pages/Game/components/SevenWondersGame/components/MainBoard/utilities/getResourceTradePrices';

import Card from 'client/pages/Game/components/SevenWondersGame/components/Card/Card';
import Actions from 'client/pages/Game/components/SevenWondersGame/components/MainBoard/components/HandCard/components/Actions/Actions';

import { HOVER_SOUND, playSound } from 'client/sounds';

import styles from './HandCard.module.scss';

interface HandCardProps {
  card: CardModel;
  cardIndex: number;
  player: Player;
  gamePhase: GamePhaseType | null;
  leftNeighbor: Player;
  rightNeighbor: Player;
  courtesansBuildInfo: CourtesansBuildInfo | null;
  isChosen: boolean;
  isDisabled: boolean;
  isViewingLeaders: boolean;
  resourceTradePrices: ResourceTradePrices;
  resourcePools: OwnerResource[][];
  wonderLevelBuildType: BuildKind;
  wonderLevelTradeVariants: TradeVariant[];
  onCardAction(cardIndex: number, action: Action, payments?: Payments): void;
  onCancelCard(): void;
  onStartCopyingLeader(cardIndex: number, action: Action, payments?: Payments): void;
}

const HandCard: React.FC<HandCardProps> = (props) => {
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
