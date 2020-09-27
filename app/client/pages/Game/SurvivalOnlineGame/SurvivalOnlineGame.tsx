import React, { useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';
import block from 'bem-cn';
import { useRecoilValue } from 'recoil';

import { EGameEvent } from 'common/types/game';
import {
  EPexesoGameEvent,
  IPexesoGameInfoEvent,
} from 'common/types/pexeso';
import { ESurvivalOnlineGameEvent, ISurvivalOnlinePlayer } from 'common/types/survivalOnline';

import Box from 'client/components/common/Box/Box';

import userAtom from 'client/atoms/userAtom';

interface ISurvivalOnlineGameProps {
  io: SocketIOClient.Socket;
}

const b = block('SurvivalOnlineGame');

const Root = styled(Box)`
  .SurvivalOnlineGame {

  }
`;

const SurvivalOnlineGame: React.FC<ISurvivalOnlineGameProps> = (props) => {
  const { io } = props;

  const [players, setPlayers] = useState<ISurvivalOnlinePlayer[]>([]);

  const user = useRecoilValue(userAtom);

  const player = useMemo(() => {
    return players.find(({ login }) => login === user?.login);
  }, [players, user]);

  useEffect(() => {
    io.emit(EGameEvent.GAME_EVENT, ESurvivalOnlineGameEvent.GET_GAME_INFO);

    io.on(ESurvivalOnlineGameEvent.GAME_INFO, ({
      players,
    }: IPexesoGameInfoEvent) => {
      setPlayers(players);
    });

    io.on(EPexesoGameEvent.UPDATE_PLAYERS, (players: ISurvivalOnlinePlayer[]) => {
      setPlayers(players);
    });
  }, [io]);

  return (
    <Root className={b()}>

    </Root>
  );
};

export default React.memo(SurvivalOnlineGame);
