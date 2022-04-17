import React, { useCallback } from 'react';

import {
  ESevenWondersGamePhase,
  ISevenWondersPlayer,
  TSevenWondersAction,
  TSevenWondersPayments,
} from 'common/types/sevenWonders';
import {
  ISevenWondersCourtesansBuildInfo,
} from 'client/pages/Game/components/SevenWondersGame/components/MainBoard/types';
import { ISevenWondersCard } from 'common/types/sevenWonders/cards';

import DraftLeaderActions
  from 'client/pages/Game/components/SevenWondersGame/components/MainBoard/components/HandCard/components/Actions/components/DraftLeaderAction/DraftLeaderAction';
import CancelAction
  from 'client/pages/Game/components/SevenWondersGame/components/MainBoard/components/HandCard/components/Actions/components/CancelAction/CancelAction';
import CourtesanAction
  from 'client/pages/Game/components/SevenWondersGame/components/MainBoard/components/HandCard/components/Actions/components/CourtesanAction/CourtesanAction';
import BuildActions
  from 'client/pages/Game/components/SevenWondersGame/components/MainBoard/components/HandCard/components/Actions/components/BuildActions/BuildActions';

interface IActionsProps {
  className?: string;
  cardIndex: number;
  card: ISevenWondersCard;
  player: ISevenWondersPlayer;
  leftNeighbor: ISevenWondersPlayer;
  rightNeighbor: ISevenWondersPlayer;
  isChosen: boolean;
  gamePhase: ESevenWondersGamePhase;
  courtesansBuildInfo: ISevenWondersCourtesansBuildInfo | null;
  onCancelCard(): void;
  onCardAction(cardIndex: number, action: TSevenWondersAction, payments?: TSevenWondersPayments): void;
  onStartCopyingLeader(cardIndex: number, action: TSevenWondersAction, payments?: TSevenWondersPayments): void;
}

const Actions: React.FC<IActionsProps> = (props) => {
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
    onCancelCard,
    onCardAction,
    onStartCopyingLeader,
  } = props;

  const handleIndexCardAction = useCallback((action: TSevenWondersAction, payments?: TSevenWondersPayments) => {
    onCardAction(cardIndex, action, payments);
  }, [cardIndex, onCardAction]);

  if (isChosen) {
    return (
      <CancelAction className={className} onCancelCard={onCancelCard}  />
    );
  }

  if (courtesansBuildInfo) {
    return (
      <CourtesanAction className={className} card={card} courtesansBuildInfo={courtesansBuildInfo} onCardAction={onCardAction} />
    );
  }

  if (gamePhase === ESevenWondersGamePhase.DRAFT_LEADERS) {
    return (
      <DraftLeaderActions className={className} onCardAction={handleIndexCardAction} />
    );
  }

  return (
    <BuildActions
      className={className}
      player={player}
      cardIndex={cardIndex}
      card={card}
      leftNeighbor={leftNeighbor}
      rightNeighbor={rightNeighbor}
      onCardAction={handleIndexCardAction}
      onStartCopyingLeader={onStartCopyingLeader}
    />
  );
};

export default React.memo(Actions);
