import React, { useMemo } from 'react';
import styled from 'styled-components';
import block from 'bem-cn';

import {
  ISevenWondersPlayer,
  TSevenWondersAction,
  TSevenWondersPayments,
} from 'common/types/sevenWonders';
import { ISevenWondersCard } from 'common/types/sevenWonders/cards';

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
  card: ISevenWondersCard;
  player: ISevenWondersPlayer;
  leftNeighbor: ISevenWondersPlayer;
  rightNeighbor: ISevenWondersPlayer;
  onCardAction(action: TSevenWondersAction, payments?: TSevenWondersPayments): void;
  onStartCopyingLeader(cardIndex: number, action: TSevenWondersAction, payments?: TSevenWondersPayments): void;
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
