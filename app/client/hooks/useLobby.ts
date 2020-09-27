import { useHistory } from 'react-router-dom';
import { useCallback, useEffect, useRef, useState } from 'react';
import io from 'socket.io-client';

import { ELobbyEvent, ILobby } from 'common/types/lobby';
import { EGame } from 'common/types';
import { TGameOptions } from 'common/types/game';

export default function useLobby<Game extends EGame>(game: Game, gameOptions: TGameOptions<Game>) {
  const history = useHistory();
  const ioRef = useRef<SocketIOClient.Socket>();

  const [lobby, setLobby] = useState<ILobby<Game> | null>(null);

  const createRoom = useCallback(() => {
    if (!ioRef.current) {
      return;
    }

    ioRef.current.emit(ELobbyEvent.CREATE_ROOM, gameOptions);
  }, [gameOptions]);

  const enterRoom = useCallback((roomId: string) => {
    if (!ioRef.current) {
      return;
    }

    ioRef.current.emit(ELobbyEvent.ENTER_ROOM, roomId);

    history.push(`/${game}/room/${roomId}`);
  }, [game, history]);

  useEffect(() => {
    ioRef.current = io.connect(`/${game}/lobby`);

    ioRef.current.on(ELobbyEvent.UPDATE, (lobbyData: ILobby<Game>) => {
      setLobby(lobbyData);
    });

    return () => {
      if (ioRef.current) {
        ioRef.current.disconnect();
      }
    };
  }, [game]);

  return {
    lobby,
    createRoom,
    enterRoom,
  };
}
