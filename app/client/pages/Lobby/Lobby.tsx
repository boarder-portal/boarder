import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import io  from 'socket.io-client';

import { EGame } from 'common/types';
import { ELobbyEvent, ILobby } from 'common/types/lobby';

import Button from 'client/components/common/Button/Button';
import Room from 'client/pages/Lobby/components/Room/Room';
import Box from 'client/components/common/Box/Box';

const Lobby: React.FC = () => {
  const { game } = useParams<{ game: EGame }>();
  const history = useHistory();
  const ioRef = useRef<SocketIOClient.Socket>();

  const [lobby, setLobby] = useState<ILobby | null>(null);

  const handleCreateRoom = useCallback(() => {
    if (!ioRef.current) {
      return;
    }

    ioRef.current.emit(ELobbyEvent.CREATE_ROOM);
  }, []);

  const handleEnterRoom = useCallback((roomId: string) => {
    if (!ioRef.current) {
      return;
    }

    ioRef.current.emit(ELobbyEvent.ENTER_ROOM, roomId);

    history.push(`/${game}/room/${roomId}`);
  }, [game, history]);

  useEffect(() => {
    ioRef.current = io.connect(`/${game}/lobby`);

    ioRef.current.on(ELobbyEvent.UPDATE, (lobbyData: ILobby) => {
      setLobby(lobbyData);
    });

    return () => {
      if (ioRef.current) {
        ioRef.current.disconnect();
      }
    };
  }, [game]);

  if (!lobby) {
    return null;
  }

  return (
    <div>
      <Box size="xxl" bold>{game}</Box>

      <Box mt={20}>
        <Button onClick={handleCreateRoom}>Создать комнату</Button>
      </Box>

      <Box between={8} mt={20}>
        {lobby.rooms.map((room) => (
          <Room
            key={room.id}
            room={room}
            onEnter={handleEnterRoom}
          />
        ))}
      </Box>
    </div>
  );
};

export default React.memo(Lobby);
