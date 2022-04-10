import React, { useCallback, useEffect, useMemo } from 'react';
import styled from 'styled-components';
import block from 'bem-cn';
import { ArrowLeft, ArrowRight } from '@material-ui/icons';

import {
  ESevenWondersGameEvent, ESevenWondersGamePhase,
  ESevenWondersNeighborSide,
  ISevenWondersExecuteActionEvent,
  ISevenWondersPlayer,
  TSevenWondersAction,
  TSevenWondersPayments,
} from 'common/types/sevenWonders';
import { ISevenWondersCard } from 'common/types/sevenWonders/cards';

import getAllPlayerEffects from 'common/utilities/sevenWonders/getAllPlayerEffects';
import { isTradeEffect } from 'common/utilities/sevenWonders/isEffect';
import getResourceTradePrices
  from 'client/pages/Game/components/SevenWondersGame/components/MainBoard/utilities/getResourceTradePrices';
import getCity from 'common/utilities/sevenWonders/getCity';
import getAgeDirection from 'common/utilities/sevenWonders/getAgeDirection';
import getPlayerHandCards from 'common/utilities/sevenWonders/getPlayerHandCards';
import getPlayerResourcePools
  from 'client/pages/Game/components/SevenWondersGame/components/MainBoard/utilities/getPlayerResourcePools/getPlayerResourcePools';

import Box from 'client/components/common/Box/Box';
import Wonder from 'client/pages/Game/components/SevenWondersGame/components/Wonder/Wonder';
import HandCard from 'client/pages/Game/components/SevenWondersGame/components/MainBoard/components/HandCard/HandCard';
import useWonderLevelBuildInfo
  from 'client/pages/Game/components/SevenWondersGame/components/MainBoard/components/HandCard/hooks/useWonderLevelBuildInfo';

import { NEW_TURN, playSound, SELECT_SOUND } from 'client/sounds';
import { usePrevious } from 'client/hooks/usePrevious';

interface IMainBoardProps {
  className?: string;
  io: SocketIOClient.Socket;
  player: ISevenWondersPlayer;
  discard: ISevenWondersCard[];
  age: number;
  gamePhase: ESevenWondersGamePhase;
  leftNeighbor: ISevenWondersPlayer;
  rightNeighbor: ISevenWondersPlayer;
}

const b = block('MainBoard');

const Root = styled(Box)`
  padding-bottom: 125px;

  .MainBoard {
    &__wonder {
      max-width: 500px;
    }

    &__handWrapper {
      position: fixed;
      bottom: -100px;
      z-index: 24;
    }

    &__leftArrow,
    &__rightArrow {
      position: absolute;
      top: 60px;
      width: 50px;
      height: 50px;
    }

    &__leftArrow {
      left: -50px;
    }

    &__rightArrow {
      right: -50px;
    }
  }
`;

const MainBoard: React.FC<IMainBoardProps> = (props) => {
  const { className, io, player, discard, age, gamePhase, leftNeighbor, rightNeighbor } = props;

  const city = useMemo(() => getCity(player.city, player.citySide), [player.city, player.citySide]);
  const cardsDirection = useMemo(() => getAgeDirection(age), [age]);

  const chosenCardIndex = player.chosenActionEvent?.cardIndex;

  const handleCardAction = useCallback((cardIndex: number, action: TSevenWondersAction, payments?: TSevenWondersPayments) => {
    playSound(SELECT_SOUND);

    const data: ISevenWondersExecuteActionEvent = {
      cardIndex,
      action,
      payments,
    };

    console.log(ESevenWondersGameEvent.EXECUTE_ACTION, data);

    io.emit(ESevenWondersGameEvent.EXECUTE_ACTION, data);
  }, [io]);

  const cancelCard = useCallback(() => {
    playSound(SELECT_SOUND);

    io.emit(ESevenWondersGameEvent.CANCEL_ACTION);
  }, [io]);

  const hand = useMemo(() => getPlayerHandCards(player, discard, gamePhase), [discard, gamePhase, player]);
  const prevHand = usePrevious(hand);

  const resourcePools = useMemo(() => getPlayerResourcePools(player, leftNeighbor, rightNeighbor), [leftNeighbor, player, rightNeighbor]);

  const tradeEffects = useMemo(() => getAllPlayerEffects(player).filter(isTradeEffect), [player]);
  const resourceTradePrices = useMemo(() => getResourceTradePrices(tradeEffects), [tradeEffects]);

  const wonderLevelPrice = useMemo(() => city.wonders[player.builtStages.length]?.price || null, [city.wonders, player.builtStages.length]);
  const wonderLevelBuildInfo = useWonderLevelBuildInfo(wonderLevelPrice, resourcePools, resourceTradePrices, player, handleCardAction);

  useEffect(() => {
    if (hand.length !== prevHand.length && document.hidden) {
      playSound(NEW_TURN);
    }
  }, [hand.length, prevHand.length]);

  return (
    <Root className={b.mix(className)} flex alignItems="center" column between={12}>
      <Wonder className={b('wonder')} player={player} />

      <Box className={b('handWrapper')}>
        <Box flex between={-35}>
          {hand.map((card, index) => (
            <HandCard
              key={index}
              card={card}
              cardIndex={index}
              player={player}
              gamePhase={gamePhase}
              resourcePools={resourcePools}
              resourceTradePrices={resourceTradePrices}
              wonderLevelBuildInfo={wonderLevelBuildInfo}
              isChosen={index === chosenCardIndex}
              isDisabled={
                chosenCardIndex === undefined
                  ? !player.waitingForAction
                  : index !== chosenCardIndex
              }
              onCardAction={handleCardAction}
              onCancelCard={cancelCard}
            />
          ))}
        </Box>

        {cardsDirection === ESevenWondersNeighborSide.LEFT ?
          <ArrowLeft className={b('leftArrow').toString()} /> :
          <ArrowRight className={b('rightArrow').toString()} />}
      </Box>
    </Root>
  );
};

export default React.memo(MainBoard);
