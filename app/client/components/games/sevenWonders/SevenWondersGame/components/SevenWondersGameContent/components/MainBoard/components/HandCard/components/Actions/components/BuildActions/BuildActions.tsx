import { FC, memo } from 'react';

import { BuildKind } from 'client/components/games/sevenWonders/SevenWondersGame/components/SevenWondersGameContent/components/MainBoard/components/HandCard/types';
import { OwnerResource } from 'client/components/games/sevenWonders/SevenWondersGame/components/SevenWondersGameContent/components/MainBoard/types';
import { WithClassName } from 'client/types/react';
import { Action, Payments, Player } from 'common/types/games/sevenWonders';
import { Card } from 'common/types/games/sevenWonders/cards';

import { TradeVariant } from 'client/components/games/sevenWonders/SevenWondersGame/components/SevenWondersGameContent/components/MainBoard/components/HandCard/utilities/getTradeVariantsByPurchaseVariants';
import { ResourceTradePrices } from 'client/components/games/sevenWonders/SevenWondersGame/components/SevenWondersGameContent/components/MainBoard/utilities/getResourceTradePrices';

import BuildCardActions from 'client/components/games/sevenWonders/SevenWondersGame/components/SevenWondersGameContent/components/MainBoard/components/HandCard/components/Actions/components/BuildActions/components/BuildCardActions/BuildCardActions';
import BuildWonderLevelAction from 'client/components/games/sevenWonders/SevenWondersGame/components/SevenWondersGameContent/components/MainBoard/components/HandCard/components/Actions/components/BuildActions/components/BuildWonderLevelAction/BuildWonderLevelAction';
import DiscardAction from 'client/components/games/sevenWonders/SevenWondersGame/components/SevenWondersGameContent/components/MainBoard/components/HandCard/components/Actions/components/BuildActions/components/DiscardAction/DiscardAction';

interface BuildActionsProps extends WithClassName {
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

const BuildActions: FC<BuildActionsProps> = (props) => {
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

export default memo(BuildActions);
