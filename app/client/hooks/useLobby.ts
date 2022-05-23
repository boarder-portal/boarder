import { useHistory } from 'react-router-dom';
import { useCallback, useState } from 'react';

import { ELobbyEvent, ILobbyEventMap, ILobbyUpdateEvent } from 'common/types/lobby';
import { EGame, TGameOptions } from 'common/types/game';

import useSocket from 'client/hooks/useSocket';

interface IUseLobbyReturnValue<Game extends EGame> {
  lobby: ILobbyUpdateEvent<Game> | null;

  createGame(): void;
  enterGame(gameId: string): void;
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

  const createGame = useCallback(() => {
    // @ts-ignore
    socket?.emit(ELobbyEvent.CREATE_GAME, gameOptions);
  }, [gameOptions, socket]);

  const enterGame = useCallback(
    (gameId: string) => {
      history.push(`/${game}/game/${gameId}`);
    },
    [game, history],
  );

  return {
    lobby,
    createGame,
    enterGame,
  };
}
