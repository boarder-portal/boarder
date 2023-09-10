import React from 'react';

import { BuildKind } from 'client/pages/Game/components/SevenWondersGame/components/MainBoard/components/HandCard/types';
import { OwnerResource } from 'client/pages/Game/components/SevenWondersGame/components/MainBoard/types';
import { Action, Payments, Player } from 'common/types/sevenWonders';
import { Card } from 'common/types/sevenWonders/cards';

import { TradeVariant } from 'client/pages/Game/components/SevenWondersGame/components/MainBoard/components/HandCard/utilities/getTradeVariantsByPurchaseVariants';
import { ResourceTradePrices } from 'client/pages/Game/components/SevenWondersGame/components/MainBoard/utilities/getResourceTradePrices';

import BuildCardActions from 'client/pages/Game/components/SevenWondersGame/components/MainBoard/components/HandCard/components/Actions/components/BuildActions/components/BuildCardActions/BuildCardActions';
import BuildWonderLevelAction from 'client/pages/Game/components/SevenWondersGame/components/MainBoard/components/HandCard/components/Actions/components/BuildActions/components/BuildWonderLevelAction/BuildWonderLevelAction';
import DiscardAction from 'client/pages/Game/components/SevenWondersGame/components/MainBoard/components/HandCard/components/Actions/components/BuildActions/components/DiscardAction/DiscardAction';

interface BuildActionsProps {
  className?: string;
  cardIndex: number;
  card: Card;
  player: Player;
  leftNeighbor: Player;
  rightNeighbor: Player;
  resourceTradePrices: ResourceTradePrices;
  resourcePools: OwnerResource[][];
  wonderLevelBuildType: BuildKind;
  wonderLevelTradeVariants: TradeVariant[];
  onCardAction(action: Action, payments?: Payments): void;
  onStartCopyingLeader(cardIndex: number, action: Action, payments?: Payments): void;
}

const BuildActions: React.FC<BuildActionsProps> = (props) => {
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
      <div className={className}>
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
      </div>
    </>
  );
};

export default React.memo(BuildActions);
