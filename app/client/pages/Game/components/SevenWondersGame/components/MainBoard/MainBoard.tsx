import React, { useCallback, useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';
import block from 'bem-cn';
import { ArrowLeft, ArrowRight } from '@material-ui/icons';

import {
  ECardActionType,
  EGameEvent,
  EGamePhase,
  ENeighborSide,
  IExecuteActionEvent,
  IPlayer,
  TAction,
  TPayments,
} from 'common/types/sevenWonders';
import { ICard } from 'common/types/sevenWonders/cards';
import {
  ISevenWondersCourtesansBuildInfo,
} from 'client/pages/Game/components/SevenWondersGame/components/MainBoard/types';
import {
  EBuildType,
} from 'client/pages/Game/components/SevenWondersGame/components/MainBoard/components/HandCard/types';

import getAgeDirection from 'common/utilities/sevenWonders/getAgeDirection';
import getHand from 'client/pages/Game/components/SevenWondersGame/components/MainBoard/utilities/getHand';
import getPlayerResourcePools
  from 'client/pages/Game/components/SevenWondersGame/components/MainBoard/utilities/getPlayerResourcePools/getPlayerResourcePools';
import getTradeVariants
  from 'client/pages/Game/components/SevenWondersGame/components/MainBoard/utilities/getTradeVariants';
import getPossibleBuildActions from 'common/utilities/sevenWonders/getPossibleBuildActions';
import getBuildType
  from 'client/pages/Game/components/SevenWondersGame/components/MainBoard/components/HandCard/utilities/getBuildType';
import getCity from 'common/utilities/sevenWonders/getCity';
import getAllPlayerEffects from 'common/utilities/sevenWonders/getAllPlayerEffects';
import { isTradeEffect } from 'common/utilities/sevenWonders/isEffect';
import getResourceTradePrices
  from 'client/pages/Game/components/SevenWondersGame/components/MainBoard/utilities/getResourceTradePrices';
import getObjectSpecificResources
  from 'client/pages/Game/components/SevenWondersGame/components/MainBoard/utilities/getPlayerResourcePools/utilities/getObjectSpecificResources';
import getResourcePoolsWithAdditionalResources
  from 'client/pages/Game/components/SevenWondersGame/components/MainBoard/utilities/getResourcePoolsWithAdditionalResources';

import BackCard from 'client/pages/Game/components/SevenWondersGame/components/MainBoard/components/BackCard/BackCard';
import HandCard from 'client/pages/Game/components/SevenWondersGame/components/MainBoard/components/HandCard/HandCard';
import Wonder from 'client/pages/Game/components/SevenWondersGame/components/Wonder/Wonder';
import Box from 'client/components/common/Box/Box';

import { usePrevious } from 'client/hooks/usePrevious';
import { NEW_TURN, playSound, SELECT_SOUND } from 'client/sounds';

interface IMainBoardProps {
  className?: string;
  io: SocketIOClient.Socket;
  player: IPlayer;
  discard: ICard[];
  age: number;
  gamePhase: EGamePhase;
  leftNeighbor: IPlayer;
  rightNeighbor: IPlayer;
}

const b = block('MainBoard');

const Root = styled(Box)`
  padding-bottom: 125px;

  .MainBoard {
    &__wonderWrapper {
      position: relative;
      max-width: 500px;
    }

    &__switchHand {
      position: absolute;
      left: -140px;
      top: 150px;
      cursor: pointer;
    }

    &__handWrapper {
      position: fixed;
      bottom: -200px;
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

  const [isViewingLeaders, setIsViewingLeaders] = useState(false);
  const [courtesansBuildInfo, setCourtesansBuildInfo] = useState<ISevenWondersCourtesansBuildInfo | null>(null);

  const cardsDirection = useMemo(() => getAgeDirection(age), [age]);

  const chosenCardIndex = player.chosenActionEvent?.cardIndex;

  const handleStartCopyingLeader = useCallback((cardIndex: number, action: TAction, payments?: TPayments) => {
    setCourtesansBuildInfo({
      cardIndex,
      action,
      payments,
    });
  }, []);

  const handleCardAction = useCallback((cardIndex: number, action: TAction, payments?: TPayments) => {
    playSound(SELECT_SOUND);
    setCourtesansBuildInfo(null);

    const data: IExecuteActionEvent = {
      cardIndex,
      action,
      payments,
    };

    console.log(EGameEvent.EXECUTE_ACTION, data);

    io.emit(EGameEvent.EXECUTE_ACTION, data);
  }, [io]);

  const cancelCard = useCallback(() => {
    playSound(SELECT_SOUND);

    io.emit(EGameEvent.CANCEL_ACTION);
  }, [io]);

  const handleClickHandSwitcher = useCallback(() => {
    setIsViewingLeaders((v) => !v);
  }, []);

  const hand = useMemo(() => getHand(
    player,
    discard,
    gamePhase,
    Boolean(courtesansBuildInfo),
    leftNeighbor,
    rightNeighbor,
    isViewingLeaders,
  ), [player, discard, gamePhase, courtesansBuildInfo, leftNeighbor, rightNeighbor, isViewingLeaders]);

  const prevHand = usePrevious(hand);

  const city = useMemo(() => getCity(player.city, player.citySide), [player.city, player.citySide]);
  const tradeEffects = useMemo(() => getAllPlayerEffects(player).filter(isTradeEffect), [player]);
  const resourceTradePrices = useMemo(() => getResourceTradePrices(tradeEffects), [tradeEffects]);

  const resourcePools = useMemo(() =>
    getPlayerResourcePools(player, leftNeighbor, rightNeighbor),
  [leftNeighbor, player, rightNeighbor],
  );

  const wonderLevelPrice = useMemo(() => city.wonders[player.builtStages.length]?.price || null, [city.wonders, player.builtStages.length]);

  const wonderLevelResourcePools = useMemo(() => {
    const objectSpecificResources = getObjectSpecificResources(player, 'wonderLevel');

    return getResourcePoolsWithAdditionalResources(resourcePools, objectSpecificResources);
  },
  [player, resourcePools],
  );

  const wonderLevelTradeVariants = useMemo(() =>
    getTradeVariants(wonderLevelPrice, wonderLevelResourcePools, resourceTradePrices)
      .filter(({ payments }) => payments.LEFT + payments.RIGHT <= player.coins),
  [player.coins, resourceTradePrices, wonderLevelPrice, wonderLevelResourcePools]);

  const wonderLevelBuildType = useMemo(() => {
    if (player.builtStages.length === city.wonders.length) {
      return EBuildType.ALREADY_BUILT;
    }

    if (!getPossibleBuildActions(player).includes(ECardActionType.BUILD_WONDER_STAGE)) {
      return EBuildType.NOT_ALLOWED;
    }

    return getBuildType(wonderLevelPrice, player, wonderLevelTradeVariants, 0);
  }, [wonderLevelTradeVariants, city.wonders.length, player, wonderLevelPrice]);

  useEffect(() => {
    if (hand.length !== prevHand.length && document.hidden) {
      playSound(NEW_TURN);
    }
  }, [hand.length, prevHand.length]);

  return (
    <Root className={b.mix(className)} flex alignItems="center" column between={12}>
      <div className={b('wonderWrapper')}>
        <Wonder className={b('wonder')} player={player} />

        {gamePhase !== EGamePhase.RECRUIT_LEADERS && (
          <BackCard
            className={b('switchHand')}
            type={isViewingLeaders && gamePhase === EGamePhase.BUILD_STRUCTURES ? age : 'leader'}
            onClick={handleClickHandSwitcher}
          />
        )}
      </div>

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
              isViewingLeaders={isViewingLeaders}
              resourceTradePrices={resourceTradePrices}
              resourcePools={resourcePools}
              wonderLevelBuildType={wonderLevelBuildType}
              wonderLevelTradeVariants={wonderLevelTradeVariants}
              onCardAction={handleCardAction}
              onCancelCard={cancelCard}
              onStartCopyingLeader={handleStartCopyingLeader}
            />
          ))}
        </Box>

        {cardsDirection === ENeighborSide.LEFT ?
          <ArrowLeft className={b('leftArrow').toString()} /> :
          <ArrowRight className={b('rightArrow').toString()} />}
      </Box>
    </Root>
  );
};

export default React.memo(MainBoard);
