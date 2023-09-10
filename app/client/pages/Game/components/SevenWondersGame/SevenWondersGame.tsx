import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { unstable_batchedUpdates as batchedUpdates } from 'react-dom';
import classNames from 'classnames';

import { EAgePhase, EGameClientEvent, EGamePhase, ENeighborSide, IPlayer } from 'common/types/sevenWonders';
import { ICard } from 'common/types/sevenWonders/cards';
import { EGame } from 'common/types/game';

import getNeighbor from 'common/utilities/sevenWonders/getNeighbor';

import usePlayer from 'client/hooks/usePlayer';

import Wonder from 'client/pages/Game/components/SevenWondersGame/components/Wonder/Wonder';
import MainBoard from 'client/pages/Game/components/SevenWondersGame/components/MainBoard/MainBoard';
import Flex from 'client/components/common/Flex/Flex';
import Image from 'client/components/common/Image/Image';

import { IGameProps } from 'client/pages/Game/Game';

import styles from './SevenWondersGame.module.scss';

const SevenWondersGame: React.FC<IGameProps<EGame.SEVEN_WONDERS>> = (props) => {
  const { io, gameOptions, gameInfo } = props;

  const [players, setPlayers] = useState<IPlayer[]>([]);
  const [discard, setDiscard] = useState<ICard[]>([]);
  const [age, setAge] = useState<number | null>(null);
  const [gamePhase, setGamePhase] = useState<EGamePhase | null>(null);
  const [agePhase, setAgePhase] = useState<EAgePhase | null>(null);

  const player = usePlayer(players);

  const otherPlayers = useMemo(() => {
    if (!player) {
      return null;
    }

    const playerIndex = players.findIndex(({ login }) => login === player.login);

    return [...players.slice(playerIndex + 1), ...players.slice(0, playerIndex)].reverse();
  }, [player, players]);

  const leftNeighbor = useMemo(
    () => (player ? players[getNeighbor(player.index, players.length, ENeighborSide.LEFT)] : null),
    [player, players],
  );
  const rightNeighbor = useMemo(
    () => (player ? players[getNeighbor(player.index, players.length, ENeighborSide.RIGHT)] : null),
    [player, players],
  );

  const pickCitySide = useCallback(
    (citySide: number | null) => {
      io.emit(EGameClientEvent.PICK_CITY_SIDE, citySide);
    },
    [io],
  );

  useEffect(() => {
    console.log(gameInfo);

    batchedUpdates(() => {
      setPlayers(gameInfo.players);
      setDiscard(gameInfo.discard);
      setGamePhase(gameInfo.phase?.type ?? null);

      if (gameInfo.phase?.type === EGamePhase.AGE) {
        setAge(gameInfo.phase.age);
        setAgePhase(gameInfo.phase.phase);
      } else {
        setAge(null);
        setAgePhase(null);
      }
    });
  }, [gameInfo]);

  if (!player || !otherPlayers || !leftNeighbor || !rightNeighbor) {
    return null;
  }

  if (gamePhase === EGamePhase.PICK_CITY_SIDE) {
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

export default React.memo(SevenWondersGame);
