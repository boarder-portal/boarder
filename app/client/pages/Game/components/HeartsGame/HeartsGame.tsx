import React, { useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';
import block from 'bem-cn';
import { useRecoilValue } from 'recoil';

import { EGameEvent, IGameInfoEvent, IPlayer } from 'common/types/hearts';

import Box from 'client/components/common/Box/Box';

import userAtom from 'client/atoms/userAtom';

interface IHeartsGameProps {
  io: SocketIOClient.Socket;
  isGameEnd: boolean;
}

const b = block('HeartsGame');

const Root = styled(Box)`
  .HeartsGame {

  }
`;

const HeartsGame: React.FC<IHeartsGameProps> = (props) => {
  const { io } = props;

  const [players, setPlayers] = useState<IPlayer[]>([]);
  const user = useRecoilValue(userAtom);

  const player = useMemo(() => players.find(({ login }) => login === user?.login), [players, user]);

  useEffect(() => {
    io.emit(EGameEvent.GET_GAME_INFO);

    io.on(EGameEvent.GAME_INFO, (gameInfo: IGameInfoEvent) => {
      if (!user) {
        return;
      }

      console.log(EGameEvent.GAME_INFO, gameInfo);

      setPlayers(gameInfo.players);
    });

    return () => {
      io.off(EGameEvent.GAME_INFO);
    };
  }, [io, user]);

  if (!player) {
    return null;
  }

  return (
    <Root className={b()} flex column>

    </Root>
  );
};

export default React.memo(HeartsGame);
