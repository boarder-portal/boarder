import React, { useCallback, useMemo } from 'react';
import styled from 'styled-components';
import block from 'bem-cn';

import {
  ESevenWondersAdditionalActionType,
  ESevenWondersGameEvent,
  ESevenWondersNeighborSide,
  ISevenWondersExecuteActionEvent,
  ISevenWondersPlayer,
  TSevenWondersAction,
  TSevenWondersPayments,
} from 'common/types/sevenWonders';
import { ISevenWondersCard } from 'common/types/sevenWonders/cards';
import { ESevenWondersFreeCardSource } from 'common/types/sevenWonders/effects';

import {
  getPlayerResources,
} from 'client/pages/Game/components/SevenWondersGame/components/MainBoard/utilities/getPlayerResources';
import getOwnerResources
  from 'client/pages/Game/components/SevenWondersGame/components/MainBoard/utilities/getOwnerResources';
import getResourcePools
  from 'client/pages/Game/components/SevenWondersGame/components/MainBoard/utilities/getResourcePools';
import getAllPlayerEffects from 'common/utilities/sevenWonders/getAllPlayerEffects';
import { isTradeEffect } from 'common/utilities/sevenWonders/isEffect';
import getResourceTradePrices
  from 'client/pages/Game/components/SevenWondersGame/components/MainBoard/utilities/getResourceTradePrices';
import getCity from 'common/utilities/sevenWonders/getCity';

import Box from 'client/components/common/Box/Box';
import Wonder from 'client/pages/Game/components/SevenWondersGame/components/Wonder/Wonder';
import HandCard from 'client/pages/Game/components/SevenWondersGame/components/MainBoard/components/HandCard/HandCard';
import useWonderLevelBuildInfo
  from 'client/pages/Game/components/SevenWondersGame/components/MainBoard/hooks/useWonderLevelBuildInfo';

interface IMainBoardProps {
  className?: string;
  io: SocketIOClient.Socket;
  player: ISevenWondersPlayer;
  discard: ISevenWondersCard[];
  leftNeighbor: ISevenWondersPlayer;
  rightNeighbor: ISevenWondersPlayer;
}

const b = block('MainBoard');

const Root = styled(Box)`

  .MainBoard {
    &__wonder {
      max-width: 500px;
    }
  }
`;

const MainBoard: React.FC<IMainBoardProps> = (props) => {
  const { className, io, player, discard, leftNeighbor, rightNeighbor } = props;

  const city = useMemo(() => getCity(player.city, player.citySide), [player.city, player.citySide]);

  const chosenCardIndex = player.actions[0]?.cardIndex;

  const handleCardAction = useCallback((card: ISevenWondersCard, cardIndex: number, action: TSevenWondersAction, payments?: TSevenWondersPayments) => {
    const data: ISevenWondersExecuteActionEvent = {
      card,
      cardIndex,
      action,
      payments,
    };

    io.emit(ESevenWondersGameEvent.EXECUTE_ACTION, data);
  }, [io]);

  const cancelCard = useCallback(() => {
    io.emit(ESevenWondersGameEvent.CANCEL_ACTION);
  }, [io]);

  const hand = useMemo(() => {
    if (
      player.waitingAdditionalAction?.type === ESevenWondersAdditionalActionType.BUILD_CARD
      && player.waitingAdditionalAction.effect.source === ESevenWondersFreeCardSource.DISCARD
    ) {
      return discard;
    }

    return player.hand;
  }, [discard, player.hand, player.waitingAdditionalAction]);

  const resourcePools = useMemo(() => {
    const playerResources = getOwnerResources(getPlayerResources(player), 'own');
    const leftNeighborResources = getOwnerResources(getPlayerResources(leftNeighbor, true), ESevenWondersNeighborSide.LEFT);
    const rightNeighborResources = getOwnerResources(getPlayerResources(rightNeighbor, true), ESevenWondersNeighborSide.RIGHT);

    return getResourcePools([
      ...playerResources,
      ...leftNeighborResources,
      ...rightNeighborResources,
    ]);
  }, [leftNeighbor, player, rightNeighbor]);

  const tradeEffects = useMemo(() => getAllPlayerEffects(player).filter(isTradeEffect), [player]);
  const resourceTradePrices = useMemo(() => getResourceTradePrices(tradeEffects), [tradeEffects]);

  const wonderLevelPrice = useMemo(() => city.wonders[player.builtStages.length]?.price || null, [city.wonders, player.builtStages.length]);
  const wonderLevelBuildInfo = useWonderLevelBuildInfo(wonderLevelPrice, resourcePools, resourceTradePrices, player);

  return (
    <Root className={b.mix(className)} flex alignItems="center" column between={12}>
      <Wonder className={b('wonder')} player={player} />

      <Box flex between={-35}>
        {hand.map((card, index) => (
          <HandCard
            key={index}
            card={card}
            cardIndex={index}
            player={player}
            resourcePools={resourcePools}
            resourceTradePrices={resourceTradePrices}
            wonderLevelBuildInfo={wonderLevelBuildInfo}
            isChosen={index === chosenCardIndex}
            isDisabled={chosenCardIndex !== undefined && index !== chosenCardIndex}
            onCardAction={handleCardAction}
            onCancelCard={cancelCard}
          />
        ))}
      </Box>
    </Root>
  );
};

export default React.memo(MainBoard);
