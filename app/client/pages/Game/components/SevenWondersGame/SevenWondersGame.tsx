import React, { useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';
import block from 'bem-cn';
import { useRecoilValue } from 'recoil';

import { GAMES_CONFIG } from 'common/constants/gamesConfig';

import { EGame } from 'common/types/game';
import { ESevenWondersGameEvent, ISevenWondersGameInfoEvent, ISevenWondersPlayer } from 'common/types/sevenWonders';

import Box from 'client/components/common/Box/Box';

import userAtom from 'client/atoms/userAtom';

interface ISevenWondersGameProps {
  io: SocketIOClient.Socket;
  isGameEnd: boolean;
}

const {
  games: {
    [EGame.SEVEN_WONDERS]: {

    },
  },
} = GAMES_CONFIG;

const b = block('SevenWondersGame');

const Root = styled(Box)`
  .SevenWondersGame {

  }
`;

const SevenWondersGame: React.FC<ISevenWondersGameProps> = (props) => {
  const { io, isGameEnd } = props;

  const [players, setPlayers] = useState<ISevenWondersPlayer[]>([]);

  const user = useRecoilValue(userAtom);

  const player = useMemo(() => players.find(({ login }) => login === user?.login), [players, user]);

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

  return (
    <Root className={b()}>
      <div>Seven wonders here</div>
    </Root>
  );
};

export default React.memo(SevenWondersGame);
