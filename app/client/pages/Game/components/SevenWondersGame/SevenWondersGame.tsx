import React, { useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';
import block from 'bem-cn';
import { useRecoilValue } from 'recoil';

import {
  EGameEvent,
  EGamePhase,
  ENeighborSide,
  IGameInfoEvent,
  IPlayer,
} from 'common/types/sevenWonders';
import { ICard } from 'common/types/sevenWonders/cards';

import getNeighbor from 'common/utilities/sevenWonders/getNeighbor';

import Box from 'client/components/common/Box/Box';
import Wonder from 'client/pages/Game/components/SevenWondersGame/components/Wonder/Wonder';
import MainBoard from 'client/pages/Game/components/SevenWondersGame/components/MainBoard/MainBoard';

import userAtom from 'client/atoms/userAtom';

interface ISevenWondersGameProps {
  io: SocketIOClient.Socket;
  isGameEnd: boolean;
}

const b = block('SevenWondersGame');

const Root = styled(Box)`
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  top: 48px;
  width: 100%;
  background: beige;
  padding: 12px;

  .SevenWondersGame {
    &__otherPlayers {
      display: flex;
    }

    &__otherPlayerWonder {
      flex: 0 0 400px;
    }

    &__mainBoard {
      margin-top: auto;
      padding-bottom: 200px;
    }
  }
`;

const SevenWondersGame: React.FC<ISevenWondersGameProps> = (props) => {
  const { io } = props;

  const [players, setPlayers] = useState<IPlayer[]>([]);
  const [discard, setDiscard] = useState<ICard[]>([]);
  const [age, setAge] = useState<number>(0);
  const [gamePhase, setGamePhase] = useState<EGamePhase>(EGamePhase.DRAFT_LEADERS);

  const user = useRecoilValue(userAtom);

  const player = useMemo(() => players.find(({ login }) => login === user?.login), [players, user]);

  const otherPlayers = useMemo(() => {
    if (!player) {
      return null;
    }

    const playerIndex = players.findIndex(({ login }) => login === player.login);

    return [
      ...players.slice(playerIndex + 1),
      ...players.slice(0, playerIndex),
    ].reverse();
  }, [player, players]);

  const leftNeighbor = useMemo(() => player ? getNeighbor(players, player, ENeighborSide.LEFT) : null, [player, players]);
  const rightNeighbor = useMemo(() => player ? getNeighbor(players, player, ENeighborSide.RIGHT) : null, [player, players]);

  useEffect(() => {
    io.emit(EGameEvent.GET_GAME_INFO);

    io.on(EGameEvent.GAME_INFO, (gameInfo: IGameInfoEvent) => {
      if (!user) {
        return;
      }

      console.log(EGameEvent.GAME_INFO, gameInfo);

      setPlayers(gameInfo.players);
      setDiscard(gameInfo.discard);
      setAge(gameInfo.age);
      setGamePhase(gameInfo.phase);
    });

    return () => {
      io.off(EGameEvent.GAME_INFO);
    };
  }, [io, user]);

  if (!player || !otherPlayers || !leftNeighbor || !rightNeighbor) {
    return null;
  }

  return (
    <Root className={b()} flex column>
      <Box
        className={b('otherPlayers')}
        flex
        between={20}
        justifyContent="center"
      >
        {otherPlayers.map((otherPlayer) => (
          <Wonder key={otherPlayer.login} className={b('otherPlayerWonder')} player={otherPlayer} copiedLeaderId={player.copiedCard?.id} isOtherPlayer />
        ))}
      </Box>

      <MainBoard
        className={b('mainBoard')}
        io={io}
        player={player}
        discard={discard}
        age={age}
        gamePhase={gamePhase}
        leftNeighbor={leftNeighbor}
        rightNeighbor={rightNeighbor}
      />
    </Root>
  );
};

export default React.memo(SevenWondersGame);
