import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import io from 'socket.io-client';
import { useRecoilValue } from 'recoil';
import block from 'bem-cn';
import styled from 'styled-components';

import { EGame } from 'common/types';
import { ERoomEvent, IRoom } from 'common/types/room';

import Box from 'client/components/common/Box/Box';

import userAtom from 'client/atoms/userAtom';

const b = block('RoomPage');

const Root = styled.div`
  .RoomPage {
    &__user {
      cursor: pointer;
    }
  }
`;

const Room: React.FC = () => {
  const { game, roomId } = useParams<{ game: EGame; roomId: string }>();
  const ioRef = useRef<SocketIOClient.Socket>();
  const history = useHistory();

  const [room, setRoom] = useState<IRoom | null>(null);

  const user = useRecoilValue(userAtom);

  const handleUserClick = useCallback(() => {
    if (!ioRef.current) {
      return;
    }

    ioRef.current.emit(ERoomEvent.TOGGLE_USER_STATE);
  }, []);

  useEffect(() => {
    ioRef.current = io.connect(`/${game}/room/${roomId}`);

    ioRef.current.on(ERoomEvent.UPDATE, (roomData: IRoom) => {
      setRoom(roomData);
    });

    ioRef.current.on(ERoomEvent.START_GAME, (gameId: string) => {
      history.push(`/${game}/game/${gameId}`);
    });

    return () => {
      if (ioRef.current) {
        ioRef.current.disconnect();
      }
    };
  }, [game, roomId]);

  if (!room || !user) {
    return null;
  }

  return (
    <Root className={b()}>
      <Box size="xxl" bold>Комната {game}</Box>

      <Box mt={20} between={8}>
        {room.players.map(({ login, status }) => (
          <Box
            key={login}
            className={login === user.login ? b('user') : ''}
            onClick={login === user.login ? handleUserClick : undefined}
          >
            {`${login} ${status}`}
          </Box>
        ))}
      </Box>
    </Root>
  );
};

export default React.memo(Room);
