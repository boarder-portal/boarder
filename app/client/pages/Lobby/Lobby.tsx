import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import io  from 'socket.io-client';

import { EGame } from 'common/types';
import { ELobbyEvent, ILobby } from 'common/types/lobby';

import Button from 'client/components/common/Button/Button';

const Lobby: React.FC = () => {
  const { game } = useParams<{ game: EGame }>();
  const ioRef = useRef<SocketIOClient.Socket>();

  const [lobby, setLobby] = useState<ILobby | null>(null);

  const handleCreateRoom = useCallback(() => {
    if (!ioRef.current) {
      return;
    }

    ioRef.current.emit(ELobbyEvent.CREATE_ROOM);
  }, []);

  useEffect(() => {
    ioRef.current = io.connect(`/${game}/lobby`);

    ioRef.current.on(ELobbyEvent.UPDATE, (lobbyData: ILobby) => {
      setLobby(lobbyData);
    });
  }, [game]);

  if (!lobby) {
    return null;
  }

  return (
    <div>
      <Button onClick={handleCreateRoom}>Создать комнату</Button>

      {lobby.rooms.map(({ id }) => (
        <div key={id}>{id}</div>
      ))}
    </div>
  );
};

export default React.memo(Lobby);
