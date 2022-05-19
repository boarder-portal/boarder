import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import io, { Socket } from 'socket.io-client';
import { useRecoilValue } from 'recoil';

import { ERoomEvent, IRoomUpdateEvent } from 'common/types/room';
import { EGame } from 'common/types/game';
import { EPlayerStatus } from 'common/types';

import Box from 'client/components/common/Box/Box';
import Button from 'client/components/common/Button/Button';

import userAtom from 'client/atoms/userAtom';

import styles from './Room.pcss';

const Room: React.FC = () => {
  const { game, roomId } = useParams<{ game: EGame; roomId: string }>();
  const ioRef = useRef<Socket>();
  const history = useHistory();

  const [room, setRoom] = useState<IRoomUpdateEvent<EGame> | null>(null);

  const user = useRecoilValue(userAtom);

  const handleUserClick = useCallback(() => {
    if (!ioRef.current) {
      return;
    }

    ioRef.current.emit(ERoomEvent.TOGGLE_USER_STATE);
  }, []);

  useEffect(() => {
    ioRef.current = io(`/${game}/room/${roomId}`);

    ioRef.current.on(ERoomEvent.UPDATE, (roomData: IRoomUpdateEvent<EGame>) => {
      console.log(ERoomEvent.UPDATE, roomData);

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
  }, [game, history, roomId]);

  if (!room || !user) {
    return null;
  }

  return (
    <div>
      <Box size="xxl" bold>
        Комната {game}
      </Box>

      <Box mt={20} between={12}>
        {room.players.map(({ login, status }) => (
          <Box key={login} className={styles.user} flex alignItems="center" between={8}>
            <div>{login}</div>
            <div>{status === EPlayerStatus.NOT_READY ? 'Не готов' : 'Готов'}</div>

            {login === user.login && (
              <Button
                className={styles.changeReadyStatusButton}
                type={status === EPlayerStatus.NOT_READY ? 'primary' : 'secondary'}
                onClick={handleUserClick}
              >
                {status === EPlayerStatus.NOT_READY ? 'Готов' : 'Не готов'}
              </Button>
            )}
          </Box>
        ))}
      </Box>
    </div>
  );
};

export default React.memo(Room);
