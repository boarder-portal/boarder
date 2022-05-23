import { useHistory } from 'react-router-dom';
import { useCallback, useState } from 'react';

import { ELobbyEvent, ILobbyEventMap, ILobbyUpdateEvent } from 'common/types/lobby';
import { EGame, TGameOptions } from 'common/types/game';

import useSocket from 'client/hooks/useSocket';

interface IUseLobbyReturnValue<Game extends EGame> {
  lobby: ILobbyUpdateEvent<Game> | null;

  createRoom(): void;
  enterRoom(roomId: string): void;
}

export default function useLobby<Game extends EGame>(
  game: Game,
  gameOptions: TGameOptions<Game>,
): IUseLobbyReturnValue<Game> {
  const history = useHistory();

  const [lobby, setLobby] = useState<ILobbyUpdateEvent<Game> | null>(null);

  const socket = useSocket<ILobbyEventMap<Game>>(`/${game}/lobby`, {
    [ELobbyEvent.UPDATE]: (lobbyData) => {
      setLobby(lobbyData);
    },
  });

  const createRoom = useCallback(() => {
    // @ts-ignore
    socket?.emit(ELobbyEvent.CREATE_ROOM, gameOptions);
  }, [gameOptions, socket]);

  const enterRoom = useCallback(
    (roomId: string) => {
      socket?.emit(ELobbyEvent.ENTER_ROOM, roomId);

      history.push(`/${game}/room/${roomId}`);
    },
    [game, history, socket],
  );

  return {
    lobby,
    createRoom,
    enterRoom,
  };
}
