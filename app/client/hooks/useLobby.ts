import { useHistory } from 'react-router-dom';
import { useCallback, useEffect, useRef, useState } from 'react';
import io from 'socket.io-client';

import { ELobbyEvent, ILobbyUpdateEvent } from 'common/types/lobby';
import { EGame, TGameOptions } from 'common/types/game';

interface IUseLobbyReturnValue<Game extends EGame> {
  lobby: ILobbyUpdateEvent<Game> | null;

  createRoom(): void;
  enterRoom(roomId: string): void;
}

export default function useLobby<Game extends EGame>(game: Game, gameOptions: TGameOptions<Game>): IUseLobbyReturnValue<Game> {
  const history = useHistory();
  const ioRef = useRef<SocketIOClient.Socket>();

  const [lobby, setLobby] = useState<ILobbyUpdateEvent<Game> | null>(null);

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

    ioRef.current.on(ELobbyEvent.UPDATE, (lobbyData: ILobbyUpdateEvent<Game>) => {
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
