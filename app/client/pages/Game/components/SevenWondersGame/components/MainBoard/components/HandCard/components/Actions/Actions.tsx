import React, { useCallback } from 'react';

import { BuildKind } from 'client/pages/Game/components/SevenWondersGame/components/MainBoard/components/HandCard/types';
import {
  CourtesansBuildInfo,
  OwnerResource,
} from 'client/pages/Game/components/SevenWondersGame/components/MainBoard/types';
import { Action, GamePhaseType, Payments, Player } from 'common/types/games/sevenWonders';
import { Card } from 'common/types/games/sevenWonders/cards';

import { TradeVariant } from 'client/pages/Game/components/SevenWondersGame/components/MainBoard/components/HandCard/utilities/getTradeVariantsByPurchaseVariants';
import { ResourceTradePrices } from 'client/pages/Game/components/SevenWondersGame/components/MainBoard/utilities/getResourceTradePrices';

import BuildActions from 'client/pages/Game/components/SevenWondersGame/components/MainBoard/components/HandCard/components/Actions/components/BuildActions/BuildActions';
import CancelAction from 'client/pages/Game/components/SevenWondersGame/components/MainBoard/components/HandCard/components/Actions/components/CancelAction/CancelAction';
import CourtesanAction from 'client/pages/Game/components/SevenWondersGame/components/MainBoard/components/HandCard/components/Actions/components/CourtesanAction/CourtesanAction';
import DraftLeaderActions from 'client/pages/Game/components/SevenWondersGame/components/MainBoard/components/HandCard/components/Actions/components/DraftLeaderAction/DraftLeaderAction';

interface ActionsProps {
  className?: string;
  cardIndex: number;
  card: Card;
  player: Player;
  leftNeighbor: Player;
  rightNeighbor: Player;
  isChosen: boolean;
  gamePhase: GamePhaseType | null;
  courtesansBuildInfo: CourtesansBuildInfo | null;
  resourceTradePrices: ResourceTradePrices;
  resourcePools: OwnerResource[][];
  wonderLevelBuildType: BuildKind;
  wonderLevelTradeVariants: TradeVariant[];
  onCancelCard(): void;
  onCardAction(cardIndex: number, action: Action, payments?: Payments): void;
  onStartCopyingLeader(cardIndex: number, action: Action, payments?: Payments): void;
}

const Actions: React.FC<ActionsProps> = (props) => {
  const {
    className,
    cardIndex,
    player,
    leftNeighbor,
    rightNeighbor,
    card,
    isChosen,
    gamePhase,
    courtesansBuildInfo,
    resourceTradePrices,
    resourcePools,
    wonderLevelBuildType,
    wonderLevelTradeVariants,
    onCancelCard,
    onCardAction,
    onStartCopyingLeader,
  } = props;

  const handleIndexCardAction = useCallback(
    (action: Action, payments?: Payments) => {
      onCardAction(cardIndex, action, payments);
    },
    [cardIndex, onCardAction],
  );

  if (isChosen) {
    return <CancelAction className={className} onCancelCard={onCancelCard} />;
  }

  if (courtesansBuildInfo) {
    return (
      <CourtesanAction
        className={className}
        card={card}
        courtesansBuildInfo={courtesansBuildInfo}
        onCardAction={onCardAction}
      />
    );
  }

  if (gamePhase === GamePhaseType.DRAFT_LEADERS) {
    return <DraftLeaderActions className={className} onCardAction={handleIndexCardAction} />;
  }

  return (
    <BuildActions
      className={className}
      player={player}
      cardIndex={cardIndex}
      card={card}
      leftNeighbor={leftNeighbor}
      rightNeighbor={rightNeighbor}
      resourceTradePrices={resourceTradePrices}
      resourcePools={resourcePools}
      wonderLevelBuildType={wonderLevelBuildType}
      wonderLevelTradeVariants={wonderLevelTradeVariants}
      onCardAction={handleIndexCardAction}
      onStartCopyingLeader={onStartCopyingLeader}
    />
  );
};

export default React.memo(Actions);
