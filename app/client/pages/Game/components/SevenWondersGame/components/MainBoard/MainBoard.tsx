import classNames from 'classnames';
import { FC, memo, useCallback, useEffect, useMemo, useState } from 'react';

import { BuildKind } from 'client/pages/Game/components/SevenWondersGame/components/MainBoard/components/HandCard/types';
import { CourtesansBuildInfo } from 'client/pages/Game/components/SevenWondersGame/components/MainBoard/types';
import { WithClassName } from 'client/types/react';
import { GameType } from 'common/types/game';
import {
  Action,
  AgePhaseType,
  CardActionType,
  ExecuteActionEvent,
  GameClientEventType,
  GameOptions,
  GamePhaseType,
  NeighborSide,
  Payments,
  Player,
} from 'common/types/games/sevenWonders';
import { Card } from 'common/types/games/sevenWonders/cards';
import { GameClientSocket } from 'common/types/socket';

import getBuildType from 'client/pages/Game/components/SevenWondersGame/components/MainBoard/components/HandCard/utilities/getBuildType';
import getHand from 'client/pages/Game/components/SevenWondersGame/components/MainBoard/utilities/getHand';
import getPlayerResourcePools from 'client/pages/Game/components/SevenWondersGame/components/MainBoard/utilities/getPlayerResourcePools/getPlayerResourcePools';
import getObjectSpecificResources from 'client/pages/Game/components/SevenWondersGame/components/MainBoard/utilities/getPlayerResourcePools/utilities/getObjectSpecificResources';
import getResourcePoolsWithAdditionalResources from 'client/pages/Game/components/SevenWondersGame/components/MainBoard/utilities/getResourcePoolsWithAdditionalResources';
import getResourceTradePrices from 'client/pages/Game/components/SevenWondersGame/components/MainBoard/utilities/getResourceTradePrices';
import getTradeVariants from 'client/pages/Game/components/SevenWondersGame/components/MainBoard/utilities/getTradeVariants';
import getAgeDirection from 'common/utilities/sevenWonders/getAgeDirection';
import getAllPlayerEffects from 'common/utilities/sevenWonders/getAllPlayerEffects';
import getPlayerCity from 'common/utilities/sevenWonders/getPlayerCity';
import getPossibleBuildActions from 'common/utilities/sevenWonders/getPossibleBuildActions';
import { isTradeEffect } from 'common/utilities/sevenWonders/isEffect';

import usePrevious from 'client/hooks/usePrevious';

import Flex from 'client/components/common/Flex/Flex';
import ArrowLeftIcon from 'client/components/icons/ArrowLeftIcon/ArrowLeftIcon';
import ArrowRightIcon from 'client/components/icons/ArrowRightIcon/ArrowRightIcon';
import BackCard from 'client/pages/Game/components/SevenWondersGame/components/MainBoard/components/BackCard/BackCard';
import HandCard from 'client/pages/Game/components/SevenWondersGame/components/MainBoard/components/HandCard/HandCard';
import Wonder from 'client/pages/Game/components/SevenWondersGame/components/Wonder/Wonder';

import { NEW_TURN, SELECT_SOUND, playSound } from 'client/sounds';

import styles from './MainBoard.module.scss';

interface MainBoardProps extends WithClassName {
  io: GameClientSocket<GameType.SEVEN_WONDERS>;
  gameOptions: GameOptions;
  player: Player;
  discard: Card[];
  age: number | null;
  gamePhase: GamePhaseType | null;
  agePhase: AgePhaseType | null;
  leftNeighbor: Player;
  rightNeighbor: Player;
}

const MainBoard: FC<MainBoardProps> = (props) => {
  const { className, io, gameOptions, player, discard, age, gamePhase, agePhase, leftNeighbor, rightNeighbor } = props;

  const [isViewingLeaders, setIsViewingLeaders] = useState(false);
  const [courtesansBuildInfo, setCourtesansBuildInfo] = useState<CourtesansBuildInfo | null>(null);

  const cardsDirection = useMemo(() => getAgeDirection(gamePhase, age ?? 0), [age, gamePhase]);

  const chosenCardIndex = player.data.turn?.chosenActionEvent?.cardIndex;

  const handleStartCopyingLeader = useCallback((cardIndex: number, action: Action, payments?: Payments) => {
    setCourtesansBuildInfo({
      cardIndex,
      action,
      payments,
    });
  }, []);

  const handleCardAction = useCallback(
    (cardIndex: number, action: Action, payments?: Payments) => {
      playSound(SELECT_SOUND);
      setCourtesansBuildInfo(null);

      const data: ExecuteActionEvent = {
        cardIndex,
        action,
        payments,
      };

      console.log(GameClientEventType.EXECUTE_ACTION, data);

      io.emit(GameClientEventType.EXECUTE_ACTION, data);
    },
    [io],
  );

  const cancelCard = useCallback(() => {
    playSound(SELECT_SOUND);

    io.emit(GameClientEventType.CANCEL_ACTION);
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
      return BuildKind.ALREADY_BUILT;
    }

    if (!getPossibleBuildActions(player).includes(CardActionType.BUILD_WONDER_STAGE)) {
      return BuildKind.NOT_ALLOWED;
    }

    return getBuildType(wonderLevelPrice, player, wonderLevelTradeVariants, 0);
  }, [player, city.wonders.length, wonderLevelPrice, wonderLevelTradeVariants]);

  useEffect(() => {
    if (hand.length !== prevHand.length && document.hidden) {
      playSound(NEW_TURN);
    }
  }, [hand.length, prevHand.length]);

  useEffect(() => {
    if (agePhase === AgePhaseType.RECRUIT_LEADERS) {
      setIsViewingLeaders(false);
    }
  }, [agePhase]);

  return (
    <Flex className={classNames(styles.root, className)} alignItems="center" direction="column" between={3}>
      <div className={styles.wonderWrapper}>
        <Wonder player={player} />

        {(gamePhase === GamePhaseType.DRAFT_LEADERS || agePhase === AgePhaseType.BUILD_STRUCTURES) &&
          gameOptions.includeLeaders && (
            <BackCard
              className={styles.switchHand}
              type={isViewingLeaders && agePhase === AgePhaseType.BUILD_STRUCTURES ? age ?? 0 : 'leader'}
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

        {cardsDirection === NeighborSide.LEFT ? (
          <ArrowLeftIcon className={styles.leftArrow} />
        ) : (
          <ArrowRightIcon className={styles.rightArrow} />
        )}
      </div>
    </Flex>
  );
};

export default memo(MainBoard);
