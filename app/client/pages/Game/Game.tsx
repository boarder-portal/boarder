import React, { ComponentType, useState } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import { Socket } from 'socket.io-client';

import { EGame, ECommonGameEvent, TGameSocketEventMap, TGameInfo, TGameEventMap } from 'common/types/game';

import PexesoGame from 'client/pages/Game/components/PexesoGame/PexesoGame';
import SurvivalOnlineGame from 'client/pages/Game/components/SurvivalOnlineGame/SurvivalOnlineGame';
import SetGame from 'client/pages/Game/components/SetGame/SetGame';
import OnitamaGame from 'client/pages/Game/components/OnitamaGame/OnitamaGame';
import CarcassonneGame from 'client/pages/Game/components/CarcassonneGame/CarcassonneGame';
import SevenWondersGame from 'client/pages/Game/components/SevenWondersGame/SevenWondersGame';
import HeartsGame from 'client/pages/Game/components/HeartsGame/HeartsGame';

import { useBoolean } from 'client/hooks/useBoolean';
import useSocket from 'client/hooks/useSocket';

export interface IGameProps<Game extends EGame> {
  io: Socket<TGameSocketEventMap<Game>>;
  gameInfo: TGameInfo<Game>;
  isGameEnd: boolean;
}

const GAMES_MAP: {
  [Game in EGame]: ComponentType<IGameProps<Game>>;
} = {
  [EGame.PEXESO]: PexesoGame,
  [EGame.SURVIVAL_ONLINE]: SurvivalOnlineGame,
  [EGame.SET]: SetGame,
  [EGame.ONITAMA]: OnitamaGame,
  [EGame.CARCASSONNE]: CarcassonneGame,
  [EGame.SEVEN_WONDERS]: SevenWondersGame,
  [EGame.HEARTS]: HeartsGame,
};

function Game<G extends EGame>() {
  const { game, gameId } = useParams<{ game: G; gameId: string }>();

  const [gameInfo, setGameInfo] = useState<TGameInfo<G> | null>(null);

  const { value: isGameEnd, setTrue: endGame } = useBoolean(false);

  const history = useHistory();

  const socket = useSocket<TGameEventMap<EGame>>(`/${game}/game/${gameId}`, {
    [ECommonGameEvent.GET_INFO]: (info: TGameInfo<G>) => {
      setGameInfo(info);
    },
    [ECommonGameEvent.END]: () => {
      console.log('GAME_END');

      endGame();
    },

    // eslint-disable-next-line camelcase
    connect_error: (err: Error) => {
      if (err.message === 'Invalid namespace') {
        history.push(`/${game}/lobby`);
      }
    },
  });

  if (!gameInfo || !socket) {
    return null;
  }

  const Game: ComponentType<IGameProps<G>> = GAMES_MAP[game];

  return <Game io={socket} isGameEnd={isGameEnd} gameInfo={gameInfo} />;
}

export default React.memo(Game);
