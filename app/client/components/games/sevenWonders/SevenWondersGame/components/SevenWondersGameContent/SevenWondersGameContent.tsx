import classNames from 'classnames';
import { FC, memo, useCallback, useEffect, useMemo } from 'react';

import { GameType } from 'common/types/game';
import { GameClientEventType, GamePhaseType, NeighborSide } from 'common/types/games/sevenWonders';

import getNeighbor from 'common/utilities/games/sevenWonders/getNeighbor';

import usePlayer from 'client/hooks/usePlayer';

import Flex from 'client/components/common/Flex/Flex';
import Image from 'client/components/common/Image/Image';
import { GameContentProps } from 'client/components/game/Game/Game';
import GameContent from 'client/components/game/GameContent/GameContent';
import MainBoard from 'client/components/games/sevenWonders/SevenWondersGame/components/SevenWondersGameContent/components/MainBoard/MainBoard';
import Wonder from 'client/components/games/sevenWonders/SevenWondersGame/components/SevenWondersGameContent/components/Wonder/Wonder';

import styles from './SevenWondersGameContent.module.scss';

const SevenWondersGameContent: FC<GameContentProps<GameType.SEVEN_WONDERS>> = (props) => {
  const {
    io,
    gameOptions,
    gameInfo,
    gameInfo: { players, discard, phase },
  } = props;

  const player = usePlayer(players);

  const gamePhase = phase?.type ?? null;
  const age = phase?.type === GamePhaseType.AGE ? phase.age : null;
  const agePhase = phase?.type === GamePhaseType.AGE ? phase.phase : null;

  const otherPlayers = useMemo(() => {
    if (!player) {
      return null;
    }

    const playerIndex = players.findIndex(({ login }) => login === player.login);

    return [...players.slice(playerIndex + 1), ...players.slice(0, playerIndex)].reverse();
  }, [player, players]);

  const leftNeighbor = useMemo(
    () => (player ? players[getNeighbor(player.index, players.length, NeighborSide.LEFT)] : null),
    [player, players],
  );
  const rightNeighbor = useMemo(
    () => (player ? players[getNeighbor(player.index, players.length, NeighborSide.RIGHT)] : null),
    [player, players],
  );

  const pickCitySide = useCallback(
    (citySide: number | null) => {
      io.emit(GameClientEventType.PICK_CITY_SIDE, citySide);
    },
    [io],
  );

  useEffect(() => {
    console.log(gameInfo);
  }, [gameInfo]);

  if (!player || !otherPlayers || !leftNeighbor || !rightNeighbor) {
    return null;
  }

  return (
    <GameContent>
      <Flex className={styles.root} direction="column" justifyContent="center">
        {gamePhase === GamePhaseType.PICK_CITY_SIDE ? (
          <Flex justifyContent="center" between={4}>
            {[0, 1].map((citySide) => {
              const isPicked = citySide === player?.data.pickCitySide?.pickedSide;

              return (
                <Image
                  key={citySide}
                  className={classNames(styles.pickCitySide, {
                    [styles.picked]: isPicked,
                  })}
                  src={`/sevenWonders/cities/${player.data.pickCitySide?.city ?? player.data.city}/${citySide}.png`}
                  onClick={() => pickCitySide(isPicked ? null : citySide)}
                />
              );
            })}
          </Flex>
        ) : (
          <>
            <Flex className={styles.otherPlayers} justifyContent="center" between={5}>
              {otherPlayers.map((otherPlayer) => (
                <Wonder
                  key={otherPlayer.login}
                  className={styles.otherPlayerWonder}
                  player={otherPlayer}
                  copiedLeaderId={player.data.copiedCard?.id}
                  isOtherPlayer
                />
              ))}
            </Flex>

            <MainBoard
              className={styles.mainBoard}
              io={io}
              gameOptions={gameOptions}
              player={player}
              discard={discard}
              age={age}
              gamePhase={gamePhase}
              agePhase={agePhase}
              leftNeighbor={leftNeighbor}
              rightNeighbor={rightNeighbor}
            />
          </>
        )}
      </Flex>
    </GameContent>
  );
};

export default memo(SevenWondersGameContent);
