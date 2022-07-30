import React, { useEffect, useMemo, useState } from 'react';
import { unstable_batchedUpdates as batchedUpdates } from 'react-dom';

import { EAgePhase, EGamePhase, ENeighborSide, IPlayer } from 'common/types/sevenWonders';
import { ICard } from 'common/types/sevenWonders/cards';
import { EGame } from 'common/types/game';

import getNeighbor from 'common/utilities/sevenWonders/getNeighbor';

import Wonder from 'client/pages/Game/components/SevenWondersGame/components/Wonder/Wonder';
import MainBoard from 'client/pages/Game/components/SevenWondersGame/components/MainBoard/MainBoard';
import Flex from 'client/components/common/Flex/Flex';

import { IGameProps } from 'client/pages/Game/Game';
import usePlayer from 'client/hooks/usePlayer';

import styles from './SevenWondersGame.pcss';

const SevenWondersGame: React.FC<IGameProps<EGame.SEVEN_WONDERS>> = (props) => {
  const { io, gameInfo } = props;

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
