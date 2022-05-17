import React, { useCallback } from 'react';

import { EGamePhase, IAgePlayerData, IPlayer, ITurnPlayerData, TAction, TPayments } from 'common/types/sevenWonders';
import {
  IOwnerResource,
  ISevenWondersCourtesansBuildInfo,
} from 'client/pages/Game/components/SevenWondersGame/components/MainBoard/types';
import { ICard } from 'common/types/sevenWonders/cards';
import { EBuildType } from 'client/pages/Game/components/SevenWondersGame/components/MainBoard/components/HandCard/types';

import { ITradeVariant } from 'client/pages/Game/components/SevenWondersGame/components/MainBoard/components/HandCard/utilities/getTradeVariantsByPurchaseVariants';
import { TResourceTradePrices } from 'client/pages/Game/components/SevenWondersGame/components/MainBoard/utilities/getResourceTradePrices';

import DraftLeaderActions from 'client/pages/Game/components/SevenWondersGame/components/MainBoard/components/HandCard/components/Actions/components/DraftLeaderAction/DraftLeaderAction';
import CancelAction from 'client/pages/Game/components/SevenWondersGame/components/MainBoard/components/HandCard/components/Actions/components/CancelAction/CancelAction';
import CourtesanAction from 'client/pages/Game/components/SevenWondersGame/components/MainBoard/components/HandCard/components/Actions/components/CourtesanAction/CourtesanAction';
import BuildActions from 'client/pages/Game/components/SevenWondersGame/components/MainBoard/components/HandCard/components/Actions/components/BuildActions/BuildActions';

interface IActionsProps {
  className?: string;
  cardIndex: number;
  card: ICard;
  player: IPlayer;
  agePlayerData: IAgePlayerData | null;
  turnPlayerData: ITurnPlayerData | null;
  leftNeighbor: IPlayer;
  rightNeighbor: IPlayer;
  isChosen: boolean;
  gamePhase: EGamePhase | null;
  courtesansBuildInfo: ISevenWondersCourtesansBuildInfo | null;
  resourceTradePrices: TResourceTradePrices;
  resourcePools: IOwnerResource[][];
  wonderLevelBuildType: EBuildType;
  wonderLevelTradeVariants: ITradeVariant[];
  onCancelCard(): void;
  onCardAction(cardIndex: number, action: TAction, payments?: TPayments): void;
  onStartCopyingLeader(cardIndex: number, action: TAction, payments?: TPayments): void;
}

const Actions: React.FC<IActionsProps> = (props) => {
  const {
    className,
    cardIndex,
    player,
    agePlayerData,
    turnPlayerData,
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
    (action: TAction, payments?: TPayments) => {
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

  if (gamePhase === EGamePhase.DRAFT_LEADERS) {
    return <DraftLeaderActions className={className} onCardAction={handleIndexCardAction} />;
  }

  return (
    <BuildActions
      className={className}
      player={player}
      agePlayerData={agePlayerData}
      turnPlayerData={turnPlayerData}
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
