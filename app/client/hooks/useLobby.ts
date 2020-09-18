import { useHistory } from 'react-router-dom';
import { useCallback, useEffect, useRef, useState } from 'react';
import io from 'socket.io-client';

import { ELobbyEvent, ILobby } from 'common/types/lobby';
import { EGame, IPlayer } from 'common/types';

export default function useLobby<Options, Player extends IPlayer>(game: EGame, gameOptions: Options) {
  const history = useHistory();
  const ioRef = useRef<SocketIOClient.Socket>();

  const [lobby, setLobby] = useState<ILobby<Options, Player> | null>(null);

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

    ioRef.current.on(ELobbyEvent.UPDATE, (lobbyData: ILobby<Options, Player>) => {
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
