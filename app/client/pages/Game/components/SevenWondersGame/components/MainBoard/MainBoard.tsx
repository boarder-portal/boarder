import React, { useCallback, useEffect, useMemo, useState } from 'react';
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
import {
  ISevenWondersCourtesansBuildInfo,
} from 'client/pages/Game/components/SevenWondersGame/components/MainBoard/types';

import getAgeDirection from 'common/utilities/sevenWonders/getAgeDirection';
import getHand from 'client/pages/Game/components/SevenWondersGame/components/MainBoard/utilities/getHand';

import Box from 'client/components/common/Box/Box';
import Wonder from 'client/pages/Game/components/SevenWondersGame/components/Wonder/Wonder';
import HandCard from 'client/pages/Game/components/SevenWondersGame/components/MainBoard/components/HandCard/HandCard';

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

  const [courtesansBuildInfo, setCourtesansBuildInfo] = useState<ISevenWondersCourtesansBuildInfo | null>(null);

  const cardsDirection = useMemo(() => getAgeDirection(age), [age]);

  const chosenCardIndex = player.chosenActionEvent?.cardIndex;

  const handleStartCopyingLeader = useCallback((cardIndex: number, action: TSevenWondersAction, payments?: TSevenWondersPayments) => {
    setCourtesansBuildInfo({
      cardIndex,
      action,
      payments,
    });
  }, []);

  const handleCardAction = useCallback((cardIndex: number, action: TSevenWondersAction, payments?: TSevenWondersPayments) => {
    playSound(SELECT_SOUND);
    setCourtesansBuildInfo(null);

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

  const hand = useMemo(() => getHand(
    player,
    discard,
    gamePhase,
    Boolean(courtesansBuildInfo),
    leftNeighbor,
    rightNeighbor,
  ), [discard, gamePhase, courtesansBuildInfo, leftNeighbor, player, rightNeighbor]);
  const prevHand = usePrevious(hand);

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
              leftNeighbor={leftNeighbor}
              rightNeighbor={rightNeighbor}
              courtesansBuildInfo={courtesansBuildInfo}
              isChosen={index === chosenCardIndex}
              isDisabled={
                chosenCardIndex === undefined
                  ? !player.waitingForAction
                  : index !== chosenCardIndex
              }
              onCardAction={handleCardAction}
              onCancelCard={cancelCard}
              onStartCopyingLeader={handleStartCopyingLeader}
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
