import React, { useCallback, useEffect, useMemo, useState } from 'react';
import classNames from 'classnames';

import {
  EAgePhase,
  ECardActionType,
  EGameClientEvent,
  EGamePhase,
  ENeighborSide,
  IExecuteActionEvent,
  IGameOptions,
  IPlayer,
  TAction,
  TPayments,
} from 'common/types/sevenWonders';
import { ICard } from 'common/types/sevenWonders/cards';
import { ISevenWondersCourtesansBuildInfo } from 'client/pages/Game/components/SevenWondersGame/components/MainBoard/types';
import { EBuildType } from 'client/pages/Game/components/SevenWondersGame/components/MainBoard/components/HandCard/types';
import { EGame } from 'common/types/game';
import { TGameClientSocket } from 'common/types/socket';

import getAgeDirection from 'common/utilities/sevenWonders/getAgeDirection';
import getHand from 'client/pages/Game/components/SevenWondersGame/components/MainBoard/utilities/getHand';
import getPlayerResourcePools from 'client/pages/Game/components/SevenWondersGame/components/MainBoard/utilities/getPlayerResourcePools/getPlayerResourcePools';
import getTradeVariants from 'client/pages/Game/components/SevenWondersGame/components/MainBoard/utilities/getTradeVariants';
import getPossibleBuildActions from 'common/utilities/sevenWonders/getPossibleBuildActions';
import getBuildType from 'client/pages/Game/components/SevenWondersGame/components/MainBoard/components/HandCard/utilities/getBuildType';
import getPlayerCity from 'common/utilities/sevenWonders/getPlayerCity';
import getAllPlayerEffects from 'common/utilities/sevenWonders/getAllPlayerEffects';
import { isTradeEffect } from 'common/utilities/sevenWonders/isEffect';
import getResourceTradePrices from 'client/pages/Game/components/SevenWondersGame/components/MainBoard/utilities/getResourceTradePrices';
import getObjectSpecificResources from 'client/pages/Game/components/SevenWondersGame/components/MainBoard/utilities/getPlayerResourcePools/utilities/getObjectSpecificResources';
import getResourcePoolsWithAdditionalResources from 'client/pages/Game/components/SevenWondersGame/components/MainBoard/utilities/getResourcePoolsWithAdditionalResources';

import { usePrevious } from 'client/hooks/usePrevious';

import BackCard from 'client/pages/Game/components/SevenWondersGame/components/MainBoard/components/BackCard/BackCard';
import HandCard from 'client/pages/Game/components/SevenWondersGame/components/MainBoard/components/HandCard/HandCard';
import Wonder from 'client/pages/Game/components/SevenWondersGame/components/Wonder/Wonder';
import Flex from 'client/components/common/Flex/Flex';
import ArrowLeftIcon from 'client/components/icons/ArrowLeftIcon/ArrowLeftIcon';
import ArrowRightIcon from 'client/components/icons/ArrowRightIcon/ArrowRightIcon';

import { NEW_TURN, playSound, SELECT_SOUND } from 'client/sounds';

import styles from './MainBoard.module.scss';

interface IMainBoardProps {
  className?: string;
  io: TGameClientSocket<EGame.SEVEN_WONDERS>;
  gameOptions: IGameOptions;
  player: IPlayer;
  discard: ICard[];
  age: number | null;
  gamePhase: EGamePhase | null;
  agePhase: EAgePhase | null;
  leftNeighbor: IPlayer;
  rightNeighbor: IPlayer;
}

const MainBoard: React.FC<IMainBoardProps> = (props) => {
  const { className, io, gameOptions, player, discard, age, gamePhase, agePhase, leftNeighbor, rightNeighbor } = props;

  const [isViewingLeaders, setIsViewingLeaders] = useState(false);
  const [courtesansBuildInfo, setCourtesansBuildInfo] = useState<ISevenWondersCourtesansBuildInfo | null>(null);

  const cardsDirection = useMemo(() => getAgeDirection(gamePhase, age ?? 0), [age, gamePhase]);

  const chosenCardIndex = player.data.turn?.chosenActionEvent?.cardIndex;

  const handleStartCopyingLeader = useCallback((cardIndex: number, action: TAction, payments?: TPayments) => {
    setCourtesansBuildInfo({
      cardIndex,
      action,
      payments,
    });
  }, []);

  const handleCardAction = useCallback(
    (cardIndex: number, action: TAction, payments?: TPayments) => {
      playSound(SELECT_SOUND);
      setCourtesansBuildInfo(null);

      const data: IExecuteActionEvent = {
        cardIndex,
        action,
        payments,
      };

      console.log(EGameClientEvent.EXECUTE_ACTION, data);

      io.emit(EGameClientEvent.EXECUTE_ACTION, data);
    },
    [io],
  );

  const cancelCard = useCallback(() => {
    playSound(SELECT_SOUND);

    io.emit(EGameClientEvent.CANCEL_ACTION);
  }, [io]);

  const handleClickHandSwitcher = useCallback(() => {
    setIsViewingLeaders((v) => !v);
  }, []);

  const hand = useMemo(
    () =>
      getHand({
        waitingForAction: player.data.turn?.waitingForAction,
        buildCardEffects: player.data.age?.buildEffects,
        leadersHand: player.data.leadersHand,
        leadersPool: player.data.leadersDraft?.leadersPool ?? [],
        hand: player.data.age?.hand ?? [],
        discard,
        gamePhase,
        agePhase,
        pickedLeaders: player.data.leadersDraft?.pickedLeaders ?? [],
        isCopyingLeader: Boolean(courtesansBuildInfo),
        leftNeighbor,
        rightNeighbor,
        isViewingLeaders,
      }),
    [
      player.data.turn,
      player.data.age,
      player.data.leadersHand,
      player.data.leadersDraft,
      discard,
      gamePhase,
      agePhase,
      courtesansBuildInfo,
      leftNeighbor,
      rightNeighbor,
      isViewingLeaders,
    ],
  );

  const prevHand = usePrevious(hand);

  const city = useMemo(() => getPlayerCity(player.data), [player.data]);
  const tradeEffects = useMemo(() => getAllPlayerEffects(player.data).filter(isTradeEffect), [player.data]);
  const resourceTradePrices = useMemo(() => getResourceTradePrices(tradeEffects), [tradeEffects]);

  const resourcePools = useMemo(
    () => getPlayerResourcePools(player, leftNeighbor, rightNeighbor),
    [leftNeighbor, player, rightNeighbor],
  );

  const wonderLevelPrice = useMemo(
    () => city.wonders[player.data.builtStages.length]?.price || null,
    [city.wonders, player.data.builtStages.length],
  );

  const wonderLevelResourcePools = useMemo(() => {
    const objectSpecificResources = getObjectSpecificResources(player, 'wonderLevel');

    return getResourcePoolsWithAdditionalResources(resourcePools, objectSpecificResources);
  }, [player, resourcePools]);

  const wonderLevelTradeVariants = useMemo(
    () =>
      getTradeVariants(wonderLevelPrice, wonderLevelResourcePools, resourceTradePrices).filter(
        ({ payments }) => payments.LEFT + payments.RIGHT <= player.data.coins,
      ),
    [player.data.coins, resourceTradePrices, wonderLevelPrice, wonderLevelResourcePools],
  );

  const wonderLevelBuildType = useMemo(() => {
    if (player.data.builtStages.length === city.wonders.length) {
      return EBuildType.ALREADY_BUILT;
    }

    if (!getPossibleBuildActions(player).includes(ECardActionType.BUILD_WONDER_STAGE)) {
      return EBuildType.NOT_ALLOWED;
    }

    return getBuildType(wonderLevelPrice, player, wonderLevelTradeVariants, 0);
  }, [player, city.wonders.length, wonderLevelPrice, wonderLevelTradeVariants]);

  useEffect(() => {
    if (hand.length !== prevHand.length && document.hidden) {
      playSound(NEW_TURN);
    }
  }, [hand.length, prevHand.length]);

  useEffect(() => {
    if (agePhase === EAgePhase.RECRUIT_LEADERS) {
      setIsViewingLeaders(false);
    }
  }, [agePhase]);

  return (
    <Flex className={classNames(styles.root, className)} alignItems="center" direction="column" between={3}>
      <div className={styles.wonderWrapper}>
        <Wonder player={player} />

        {(gamePhase === EGamePhase.DRAFT_LEADERS || agePhase === EAgePhase.BUILD_STRUCTURES) &&
          gameOptions.includeLeaders && (
            <BackCard
              className={styles.switchHand}
              type={isViewingLeaders && agePhase === EAgePhase.BUILD_STRUCTURES ? age ?? 0 : 'leader'}
              onClick={handleClickHandSwitcher}
            />
          )}
      </div>

      <div className={styles.handWrapper}>
        <Flex className={styles.cards}>
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
              isChosen={index === chosenCardIndex && !isViewingLeaders}
              isDisabled={
                (chosenCardIndex === undefined ? !player.data.turn?.waitingForAction : index !== chosenCardIndex) &&
                !isViewingLeaders
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
        </Flex>

        {cardsDirection === ENeighborSide.LEFT ? (
          <ArrowLeftIcon className={styles.leftArrow} />
        ) : (
          <ArrowRightIcon className={styles.rightArrow} />
        )}
      </div>
    </Flex>
  );
};

export default React.memo(MainBoard);
