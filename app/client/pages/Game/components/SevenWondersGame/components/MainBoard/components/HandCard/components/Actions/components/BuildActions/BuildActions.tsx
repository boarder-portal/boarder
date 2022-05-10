import React from 'react';

import {
  IPlayer,
  TAction,
  TPayments,
} from 'common/types/sevenWonders';
import { ICard } from 'common/types/sevenWonders/cards';
import {
  EBuildType,
} from 'client/pages/Game/components/SevenWondersGame/components/MainBoard/components/HandCard/types';
import { IOwnerResource } from 'client/pages/Game/components/SevenWondersGame/components/MainBoard/types';

import {
  TResourceTradePrices,
} from 'client/pages/Game/components/SevenWondersGame/components/MainBoard/utilities/getResourceTradePrices';
import {
  ITradeVariant,
} from 'client/pages/Game/components/SevenWondersGame/components/MainBoard/components/HandCard/utilities/getTradeVariantsByPurchaseVariants';

import Box from 'client/components/common/Box/Box';
import DiscardAction
  from 'client/pages/Game/components/SevenWondersGame/components/MainBoard/components/HandCard/components/Actions/components/BuildActions/components/DiscardAction/DiscardAction';
import BuildWonderLevelAction
  from 'client/pages/Game/components/SevenWondersGame/components/MainBoard/components/HandCard/components/Actions/components/BuildActions/components/BuildWonderLevelAction/BuildWonderLevelAction';
import BuildCardActions
  from 'client/pages/Game/components/SevenWondersGame/components/MainBoard/components/HandCard/components/Actions/components/BuildActions/components/BuildCardActions/BuildCardActions';

interface IBuildActionsProps {
  className?: string;
  cardIndex: number;
  card: ICard;
  player: IPlayer;
  leftNeighbor: IPlayer;
  rightNeighbor: IPlayer;
  resourceTradePrices: TResourceTradePrices;
  resourcePools: IOwnerResource[][];
  wonderLevelBuildType: EBuildType;
  wonderLevelTradeVariants: ITradeVariant[];
  onCardAction(action: TAction, payments?: TPayments): void;
  onStartCopyingLeader(cardIndex: number, action: TAction, payments?: TPayments): void;
}

const BuildActions: React.FC<IBuildActionsProps> = (props) => {
  const {
    className,
    cardIndex,
    card,
    player,
    leftNeighbor,
    rightNeighbor,
    resourceTradePrices,
    resourcePools,
    wonderLevelBuildType,
    wonderLevelTradeVariants,
    onCardAction,
    onStartCopyingLeader,
  } = props;

  return (
    <>
      <Box className={className}>
        <BuildCardActions
          card={card}
          cardIndex={cardIndex}
          player={player}
          leftNeighbor={leftNeighbor}
          rightNeighbor={rightNeighbor}
          resourceTradePrices={resourceTradePrices}
          resourcePools={resourcePools}
          onCardAction={onCardAction}
          onStartCopyingLeader={onStartCopyingLeader}
        />

        <BuildWonderLevelAction
          player={player}
          buildType={wonderLevelBuildType}
          tradeVariants={wonderLevelTradeVariants}
          onCardAction={onCardAction}
        />

        <DiscardAction player={player} onCardAction={onCardAction} />
      </Box>
    </>
  );
};

export default React.memo(BuildActions);
