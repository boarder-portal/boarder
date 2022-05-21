import React, { useCallback, useState } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import { useRecoilValue } from 'recoil';

import { ERoomEvent, IRoomEventMap, IRoomUpdateEvent } from 'common/types/room';
import { EGame } from 'common/types/game';
import { EPlayerStatus } from 'common/types';

import Box from 'client/components/common/Box/Box';
import Button from 'client/components/common/Button/Button';

import userAtom from 'client/atoms/userAtom';
import useSocket from 'client/hooks/useSocket';

import styles from './Room.pcss';

function Room<Game extends EGame>() {
  const { game, roomId } = useParams<{ game: Game; roomId: string }>();
  const history = useHistory();

  const [room, setRoom] = useState<IRoomUpdateEvent<Game> | null>(null);

  const user = useRecoilValue(userAtom);

  const socket = useSocket<IRoomEventMap<Game>>(`/${game}/room/${roomId}`, {
    [ERoomEvent.UPDATE]: (roomData) => {
      console.log(ERoomEvent.UPDATE, roomData);

      setRoom(roomData);
    },
    [ERoomEvent.START_GAME]: (gameId) => {
      history.push(`/${game}/game/${gameId}`);
    },
  });

  const handleUserClick = useCallback(() => {
    socket?.emit(ERoomEvent.TOGGLE_USER_STATE);
  }, [socket]);

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
}

export default React.memo(Room);
