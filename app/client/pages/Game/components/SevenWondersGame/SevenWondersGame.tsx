import React, { useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';
import block from 'bem-cn';
import { useRecoilValue } from 'recoil';

import {
  ESevenWondersGameEvent,
  ESevenWondersNeighborSide,
  ISevenWondersGameInfoEvent,
  ISevenWondersPlayer,
} from 'common/types/sevenWonders';

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
      flex: 1 0 400px;
    }

    &__mainBoard {
      margin-top: auto;
    }
  }
`;

const SevenWondersGame: React.FC<ISevenWondersGameProps> = (props) => {
  const { io } = props;

  const [players, setPlayers] = useState<ISevenWondersPlayer[]>([]);

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

  const leftNeighbor = useMemo(() => player ? getNeighbor(players, player, ESevenWondersNeighborSide.LEFT) : null, [player, players]);
  const rightNeighbor = useMemo(() => player ? getNeighbor(players, player, ESevenWondersNeighborSide.RIGHT) : null, [player, players]);

  useEffect(() => {
    io.emit(ESevenWondersGameEvent.GET_GAME_INFO);

    io.on(ESevenWondersGameEvent.GAME_INFO, (gameInfo: ISevenWondersGameInfoEvent) => {
      if (!user) {
        return;
      }

      console.log(ESevenWondersGameEvent.GAME_INFO, gameInfo);

      setPlayers(gameInfo.players);
    });

    return () => {
      io.off(ESevenWondersGameEvent.GAME_INFO);
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
      >
        {otherPlayers.map((otherPlayer) => (
          <Wonder key={otherPlayer.login} className={b('otherPlayerWonder')} player={otherPlayer} />
        ))}
      </Box>

      <MainBoard
        className={b('mainBoard')}
        io={io}
        player={player}
        leftNeighbor={leftNeighbor}
        rightNeighbor={rightNeighbor}
      />
    </Root>
  );
};

export default React.memo(SevenWondersGame);
