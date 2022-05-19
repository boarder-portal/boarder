import React, { useEffect, useMemo, useState } from 'react';
import { useRecoilValue } from 'recoil';
import { unstable_batchedUpdates as batchedUpdates } from 'react-dom';

import { EAgePhase, EGameEvent, EGamePhase, ENeighborSide, IPlayer } from 'common/types/sevenWonders';
import { ICard } from 'common/types/sevenWonders/cards';
import { EGame } from 'common/types/game';

import getNeighbor from 'common/utilities/sevenWonders/getNeighbor';

import Box from 'client/components/common/Box/Box';
import Wonder from 'client/pages/Game/components/SevenWondersGame/components/Wonder/Wonder';
import MainBoard from 'client/pages/Game/components/SevenWondersGame/components/MainBoard/MainBoard';

import userAtom from 'client/atoms/userAtom';
import { IGameProps } from 'client/pages/Game/Game';

import styles from './SevenWondersGame.pcss';

interface ISevenWondersGameProps extends IGameProps<EGame.SEVEN_WONDERS> {}

const SevenWondersGame: React.FC<ISevenWondersGameProps> = (props) => {
  const { io } = props;

  const [players, setPlayers] = useState<IPlayer[]>([]);
  const [discard, setDiscard] = useState<ICard[]>([]);
  const [age, setAge] = useState<number | null>(null);
  const [gamePhase, setGamePhase] = useState<EGamePhase | null>(null);
  const [agePhase, setAgePhase] = useState<EAgePhase | null>(null);

  const user = useRecoilValue(userAtom);

  const player = useMemo(() => players.find(({ login }) => login === user?.login), [players, user]);

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
    io.emit(EGameEvent.GET_GAME_INFO);

    io.on(EGameEvent.GAME_INFO, (gameInfo) => {
      if (!user) {
        return;
      }

      console.log(EGameEvent.GAME_INFO, gameInfo);

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
    });

    return () => {
      io.off(EGameEvent.GAME_INFO);
    };
  }, [io, user]);

  if (!player || !otherPlayers || !leftNeighbor || !rightNeighbor) {
    return null;
  }

  return (
    <Box className={styles.root} flex column>
      <Box className={styles.otherPlayers} flex between={20} justifyContent="center">
        {otherPlayers.map((otherPlayer) => (
          <Wonder
            key={otherPlayer.login}
            className={styles.otherPlayerWonder}
            player={otherPlayer}
            copiedLeaderId={player.data.copiedCard?.id}
            isOtherPlayer
          />
        ))}
      </Box>

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
    </Box>
  );
};

export default React.memo(SevenWondersGame);
