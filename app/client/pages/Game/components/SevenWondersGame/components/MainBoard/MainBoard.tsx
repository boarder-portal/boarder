import React, { useCallback, useEffect, useMemo, useState } from 'react';
import ArrowLeft from '@material-ui/icons/ArrowLeft';
import ArrowRight from '@material-ui/icons/ArrowRight';
import classNames from 'classnames';

import {
  EAgePhase,
  ECardActionType,
  EGameEvent,
  EGamePhase,
  ENeighborSide,
  IAgePlayerData,
  IExecuteActionEvent,
  ILeadersDraftPlayerData,
  IPlayer,
  ITurnPlayerData,
  TAction,
  TPayments,
} from 'common/types/sevenWonders';
import { ICard } from 'common/types/sevenWonders/cards';
import { ISevenWondersCourtesansBuildInfo } from 'client/pages/Game/components/SevenWondersGame/components/MainBoard/types';
import { EBuildType } from 'client/pages/Game/components/SevenWondersGame/components/MainBoard/components/HandCard/types';

import getAgeDirection from 'common/utilities/sevenWonders/getAgeDirection';
import getHand from 'client/pages/Game/components/SevenWondersGame/components/MainBoard/utilities/getHand';
import getPlayerResourcePools from 'client/pages/Game/components/SevenWondersGame/components/MainBoard/utilities/getPlayerResourcePools/getPlayerResourcePools';
import getTradeVariants from 'client/pages/Game/components/SevenWondersGame/components/MainBoard/utilities/getTradeVariants';
import getPossibleBuildActions from 'common/utilities/sevenWonders/getPossibleBuildActions';
import getBuildType from 'client/pages/Game/components/SevenWondersGame/components/MainBoard/components/HandCard/utilities/getBuildType';
import getCity from 'common/utilities/sevenWonders/getCity';
import getAllPlayerEffects from 'common/utilities/sevenWonders/getAllPlayerEffects';
import { isTradeEffect } from 'common/utilities/sevenWonders/isEffect';
import getResourceTradePrices from 'client/pages/Game/components/SevenWondersGame/components/MainBoard/utilities/getResourceTradePrices';
import getObjectSpecificResources from 'client/pages/Game/components/SevenWondersGame/components/MainBoard/utilities/getPlayerResourcePools/utilities/getObjectSpecificResources';
import getResourcePoolsWithAdditionalResources from 'client/pages/Game/components/SevenWondersGame/components/MainBoard/utilities/getResourcePoolsWithAdditionalResources';

import BackCard from 'client/pages/Game/components/SevenWondersGame/components/MainBoard/components/BackCard/BackCard';
import HandCard from 'client/pages/Game/components/SevenWondersGame/components/MainBoard/components/HandCard/HandCard';
import Wonder from 'client/pages/Game/components/SevenWondersGame/components/Wonder/Wonder';
import Box from 'client/components/common/Box/Box';

import { usePrevious } from 'client/hooks/usePrevious';
import { NEW_TURN, playSound, SELECT_SOUND } from 'client/sounds';

import styles from './MainBoard.pcss';

interface IMainBoardProps {
  className?: string;
  io: SocketIOClient.Socket;
  player: IPlayer;
  leadersDraftPlayerData: ILeadersDraftPlayerData | null;
  agePlayerData: IAgePlayerData | null;
  turnPlayerData: ITurnPlayerData | null;
  discard: ICard[];
  age: number | null;
  gamePhase: EGamePhase | null;
  agePhase: EAgePhase | null;
  leftNeighbor: IPlayer;
  rightNeighbor: IPlayer;
}

const MainBoard: React.FC<IMainBoardProps> = (props) => {
  const {
    className,
    io,
    player,
    leadersDraftPlayerData,
    agePlayerData,
    turnPlayerData,
    discard,
    age,
    gamePhase,
    agePhase,
    leftNeighbor,
    rightNeighbor,
  } = props;

  const [isViewingLeaders, setIsViewingLeaders] = useState(false);
  const [courtesansBuildInfo, setCourtesansBuildInfo] = useState<ISevenWondersCourtesansBuildInfo | null>(null);

  const cardsDirection = useMemo(() => getAgeDirection(age ?? 0), [age]);

  const chosenCardIndex = turnPlayerData?.chosenActionEvent?.cardIndex;

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

      console.log(EGameEvent.EXECUTE_ACTION, data);

      io.emit(EGameEvent.EXECUTE_ACTION, data);
    },
    [io],
  );

  const cancelCard = useCallback(() => {
    playSound(SELECT_SOUND);

    io.emit(EGameEvent.CANCEL_ACTION);
  }, [io]);

  const handleClickHandSwitcher = useCallback(() => {
    setIsViewingLeaders((v) => !v);
  }, []);

  const hand = useMemo(
    () =>
      getHand({
        waitingForAction: turnPlayerData?.waitingForAction ?? null,
        buildCardEffects: agePlayerData?.buildEffects ?? [],
        leadersHand: player.leadersHand,
        leadersPool: leadersDraftPlayerData?.leadersPool ?? [],
        hand: agePlayerData?.hand ?? [],
        discard,
        gamePhase,
        agePhase,
        pickedLeaders: leadersDraftPlayerData?.pickedLeaders ?? [],
        isCopyingLeader: Boolean(courtesansBuildInfo),
        leftNeighbor,
        rightNeighbor,
        isViewingLeaders,
      }),
    [
      turnPlayerData,
      agePlayerData,
      player.leadersHand,
      leadersDraftPlayerData,
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

  const city = useMemo(() => getCity(player.city, player.citySide), [player.city, player.citySide]);
  const tradeEffects = useMemo(() => getAllPlayerEffects(player).filter(isTradeEffect), [player]);
  const resourceTradePrices = useMemo(() => getResourceTradePrices(tradeEffects), [tradeEffects]);

  const resourcePools = useMemo(
    () => getPlayerResourcePools(player, leftNeighbor, rightNeighbor),
    [leftNeighbor, player, rightNeighbor],
  );

  const wonderLevelPrice = useMemo(
    () => city.wonders[player.builtStages.length]?.price || null,
    [city.wonders, player.builtStages.length],
  );

  const wonderLevelResourcePools = useMemo(() => {
    const objectSpecificResources = getObjectSpecificResources(player, 'wonderLevel');

    return getResourcePoolsWithAdditionalResources(resourcePools, objectSpecificResources);
  }, [player, resourcePools]);

  const wonderLevelTradeVariants = useMemo(
    () =>
      getTradeVariants(wonderLevelPrice, wonderLevelResourcePools, resourceTradePrices).filter(
        ({ payments }) => payments.LEFT + payments.RIGHT <= player.coins,
      ),
    [player.coins, resourceTradePrices, wonderLevelPrice, wonderLevelResourcePools],
  );

  const wonderLevelBuildType = useMemo(() => {
    if (player.builtStages.length === city.wonders.length) {
      return EBuildType.ALREADY_BUILT;
    }

    if (
      !getPossibleBuildActions(turnPlayerData?.waitingForAction ?? null, agePlayerData?.buildEffects ?? []).includes(
        ECardActionType.BUILD_WONDER_STAGE,
      )
    ) {
      return EBuildType.NOT_ALLOWED;
    }

    return getBuildType(wonderLevelPrice, player, wonderLevelTradeVariants, 0);
  }, [player, city.wonders.length, turnPlayerData, agePlayerData, wonderLevelPrice, wonderLevelTradeVariants]);

  useEffect(() => {
    if (hand.length !== prevHand.length && document.hidden) {
      playSound(NEW_TURN);
    }
  }, [hand.length, prevHand.length]);

  return (
    <Box className={classNames(styles.root, className)} flex alignItems="center" column between={12}>
      <div className={styles.wonderWrapper}>
        <Wonder player={player} agePlayerData={agePlayerData} turnPlayerData={turnPlayerData} />

        {(gamePhase === EGamePhase.DRAFT_LEADERS || agePhase === EAgePhase.BUILD_STRUCTURES) && (
          <BackCard
            className={styles.switchHand}
            type={isViewingLeaders && agePhase === EAgePhase.BUILD_STRUCTURES ? age ?? 0 : 'leader'}
            onClick={handleClickHandSwitcher}
          />
        )}
      </div>

      <Box className={styles.handWrapper}>
        <Box flex between={-35}>
          {hand.map((card, index) => (
            <HandCard
              key={index}
              card={card}
              cardIndex={index}
              player={player}
              agePlayerData={agePlayerData}
              turnPlayerData={turnPlayerData}
              gamePhase={gamePhase}
              leftNeighbor={leftNeighbor}
              rightNeighbor={rightNeighbor}
              courtesansBuildInfo={courtesansBuildInfo}
              isChosen={index === chosenCardIndex}
              isDisabled={chosenCardIndex === undefined ? !turnPlayerData?.waitingForAction : index !== chosenCardIndex}
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

        {cardsDirection === ENeighborSide.LEFT ? (
          <ArrowLeft className={styles.leftArrow} />
        ) : (
          <ArrowRight className={styles.rightArrow} />
        )}
      </Box>
    </Box>
  );
};

export default React.memo(MainBoard);
