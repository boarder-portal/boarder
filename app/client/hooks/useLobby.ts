import { useHistory } from 'react-router-dom';
import { useCallback, useState } from 'react';

import { ELobbyEvent, ILobbyEventMap, ILobbyUpdateEvent } from 'common/types/lobby';
import { EGame, TGameOptions } from 'common/types/game';

import useSocket from 'client/hooks/useSocket';
import useImmutableCallback from 'client/hooks/useImmutableCallback';

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

  const navigateToGame = useImmutableCallback((gameId: string) => {
    history.push(`/${game}/game/${gameId}`);
  });

  const socket = useSocket<ILobbyEventMap<Game>>(`/${game}/lobby`, {
    [ELobbyEvent.UPDATE]: (lobbyData) => {
      setLobby(lobbyData);
    },
    [ELobbyEvent.GAME_CREATED]: navigateToGame,
  });

  const createGame = useCallback(() => {
    // @ts-ignore
    socket?.emit(ELobbyEvent.CREATE_GAME, gameOptions);
  }, [gameOptions, socket]);

  return {
    lobby,
    createGame,
    enterGame: navigateToGame,
  };
}
