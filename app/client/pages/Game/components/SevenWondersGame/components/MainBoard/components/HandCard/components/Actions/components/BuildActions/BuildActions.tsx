import React, { useMemo } from 'react';
import styled from 'styled-components';
import block from 'bem-cn';

import {
  IPlayer,
  TAction,
  TPayments,
} from 'common/types/sevenWonders';
import { ICard } from 'common/types/sevenWonders/cards';

import getAllPlayerEffects from 'common/utilities/sevenWonders/getAllPlayerEffects';
import { isTradeEffect } from 'common/utilities/sevenWonders/isEffect';
import getResourceTradePrices
  from 'client/pages/Game/components/SevenWondersGame/components/MainBoard/utilities/getResourceTradePrices';

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
  onCardAction(action: TAction, payments?: TPayments): void;
  onStartCopyingLeader(cardIndex: number, action: TAction, payments?: TPayments): void;
}

const b = block('BuildActions');

const Root = styled(Box)`
  .BuildActions {

  }
`;

const BuildActions: React.FC<IBuildActionsProps> = (props) => {
  const {
    className,
    cardIndex,
    card,
    player,
    leftNeighbor,
    rightNeighbor,
    onCardAction,
    onStartCopyingLeader,
  } = props;
  const tradeEffects = useMemo(() => getAllPlayerEffects(player).filter(isTradeEffect), [player]);
  const resourceTradePrices = useMemo(() => getResourceTradePrices(tradeEffects), [tradeEffects]);

  return (
    <>
      <Root className={b.mix(className)}>
        <BuildCardActions
          card={card}
          cardIndex={cardIndex}
          player={player}
          leftNeighbor={leftNeighbor}
          rightNeighbor={rightNeighbor}
          resourceTradePrices={resourceTradePrices}
          onCardAction={onCardAction}
          onStartCopyingLeader={onStartCopyingLeader}
        />

        <BuildWonderLevelAction
          player={player}
          leftNeighbor={leftNeighbor}
          rightNeighbor={rightNeighbor}
          resourceTradePrices={resourceTradePrices}
          onCardAction={onCardAction}
        />

        <DiscardAction player={player} onCardAction={onCardAction} />
      </Root>
    </>
  );
};

export default React.memo(BuildActions);
