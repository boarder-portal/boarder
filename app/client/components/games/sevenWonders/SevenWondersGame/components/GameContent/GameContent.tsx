import classNames from 'classnames';
import { FC, memo, useCallback, useEffect, useMemo, useState } from 'react';

import { GameType } from 'common/types/game';
import {
  AgePhaseType,
  GameClientEventType,
  GamePhaseType,
  NeighborSide,
  Player,
} from 'common/types/games/sevenWonders';
import { Card } from 'common/types/games/sevenWonders/cards';

import getNeighbor from 'common/utilities/games/sevenWonders/getNeighbor';

import usePlayer from 'client/hooks/usePlayer';

import Flex from 'client/components/common/Flex/Flex';
import Image from 'client/components/common/Image/Image';
import { GameProps } from 'client/components/game/Game/Game';
import MainBoard from 'client/components/games/sevenWonders/SevenWondersGame/components/GameContent/components/MainBoard/MainBoard';
import Wonder from 'client/components/games/sevenWonders/SevenWondersGame/components/GameContent/components/Wonder/Wonder';

import styles from './GameContent.module.scss';

const GameContent: FC<GameProps<GameType.SEVEN_WONDERS>> = (props) => {
  const { io, gameOptions, gameInfo } = props;

  const [players, setPlayers] = useState<Player[]>([]);
  const [discard, setDiscard] = useState<Card[]>([]);
  const [age, setAge] = useState<number | null>(null);
  const [gamePhase, setGamePhase] = useState<GamePhaseType | null>(null);
  const [agePhase, setAgePhase] = useState<AgePhaseType | null>(null);

  const player = usePlayer(players);

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

    setPlayers(gameInfo.players);
    setDiscard(gameInfo.discard);
    setGamePhase(gameInfo.phase?.type ?? null);

    if (gameInfo.phase?.type === GamePhaseType.AGE) {
      setAge(gameInfo.phase.age);
      setAgePhase(gameInfo.phase.phase);
    } else {
      setAge(null);
      setAgePhase(null);
    }
  }, [gameInfo]);

  if (!player || !otherPlayers || !leftNeighbor || !rightNeighbor) {
    return null;
  }

  if (gamePhase === GamePhaseType.PICK_CITY_SIDE) {
    return (
      <Flex className={styles.root} justifyContent="center" direction="column">
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
      </Flex>
    );
  }

  return (
    <Flex className={styles.root} direction="column">
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
    </Flex>
  );
};

export default memo(GameContent);
