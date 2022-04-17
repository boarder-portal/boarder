import React, { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import io from 'socket.io-client';

import { EPlayerStatus } from 'common/types';
import { EGame, EGameEvent, IGameUpdateEvent } from 'common/types/game';
import { IPlayer as IPexesoPlayer } from 'common/types/pexeso';
import { IPlayer as ISurvivalOnlinePlayer } from 'common/types/survivalOnline';
import { IPlayer as IMazePlayer } from 'common/types/maze';
import { IPlayer as ISetPlayer } from 'common/types/set';

import PexesoGame from 'client/pages/Game/components/PexesoGame/PexesoGame';
import SurvivalOnlineGame from 'client/pages/Game/components/SurvivalOnlineGame/SurvivalOnlineGame';
import MazeGame from 'client/pages/Game/components/MazeGame/MazeGame';
import SetGame from 'client/pages/Game/components/SetGame/SetGame';
import OnitamaGame from 'client/pages/Game/components/OnitamaGame/OnitamaGame';
import CarcassonneGame from 'client/pages/Game/components/CarcassonneGame/CarcassonneGame';
import SevenWondersGame from 'client/pages/Game/components/SevenWondersGame/SevenWondersGame';

import { useBoolean } from 'client/hooks/useBoolean';

const Game: React.FC = () => {
  const { game, gameId } = useParams<{ game: EGame; gameId: string }>();
  const ioRef = useRef<SocketIOClient.Socket>();

  const [gameData, setGameData] = useState<IGameUpdateEvent | null>(null);

  const {
    value: isGameEnd,
    setTrue: endGame,
  } = useBoolean(false);

  useEffect(() => {
    ioRef.current = io.connect(`/${game}/game/${gameId}`);

    ioRef.current.on(EGameEvent.UPDATE, (updatedGameData: IGameUpdateEvent) => {
      setGameData(updatedGameData);
    });

    ioRef.current.on(EGameEvent.END, () => {
      console.log('GAME_END');

      endGame();
    });

    return () => {
      if (ioRef.current) {
        ioRef.current.disconnect();
      }
    };
  }, [endGame, game, gameId]);

  if (!gameData || !ioRef.current) {
    return null;
  }

  if (gameData.players.some(({ status }) => status !== EPlayerStatus.PLAYING && status !== EPlayerStatus.DISCONNECTED)) {
    return (
      <div>Ожидание игроков...</div>
    );
  }

  if (game === EGame.PEXESO) {
    return (
      <PexesoGame
        io={ioRef.current}
        players={gameData.players as IPexesoPlayer[]}
        isGameEnd={isGameEnd}
      />
    );
  }

  if (game === EGame.SURVIVAL_ONLINE) {
    return (
      <SurvivalOnlineGame
        io={ioRef.current}
        players={gameData.players as ISurvivalOnlinePlayer[]}
        isGameEnd={isGameEnd}
      />
    );
  }

  if (game === EGame.MAZE) {
    return (
      <MazeGame
        io={ioRef.current}
        players={gameData.players as IMazePlayer[]}
        isGameEnd={isGameEnd}
      />
    );
  }

  if (game === EGame.SET) {
    return (
      <SetGame
        io={ioRef.current}
        players={gameData.players as ISetPlayer[]}
        isGameEnd={isGameEnd}
      />
    );
  }

  if (game === EGame.ONITAMA) {
    return (
      <OnitamaGame
        io={ioRef.current}
        isGameEnd={isGameEnd}
      />
    );
  }

  if (game === EGame.CARCASSONNE) {
    return (
      <CarcassonneGame
        io={ioRef.current}
        isGameEnd={isGameEnd}
      />
    );
  }

  if (game === EGame.SEVEN_WONDERS) {
    return (
      <SevenWondersGame
        io={ioRef.current}
        isGameEnd={isGameEnd}
      />
    );
  }

  return null;
};

export default React.memo(Game);
