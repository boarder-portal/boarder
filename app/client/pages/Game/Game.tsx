import React, { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import io from 'socket.io-client';

import { EGame, EPlayerStatus } from 'common/types';
import { EGameEvent, IGame } from 'common/types/game';

import PexesoGame from 'client/pages/Game/PexesoGame/PexesoGame';
import SurvivalOnlineGame from 'client/pages/Game/SurvivalOnlineGame/SurvivalOnlineGame';

const Game: React.FC = () => {
  const { game, gameId } = useParams<{ game: EGame; gameId: string }>();
  const ioRef = useRef<SocketIOClient.Socket>();

  const [gameData, setGameData] = useState<IGame | null>(null);

  useEffect(() => {
    ioRef.current = io.connect(`/${game}/game/${gameId}`);

    ioRef.current.on(EGameEvent.UPDATE, (updatedGameData: IGame) => {
      setGameData(updatedGameData);
    });

    return () => {
      if (ioRef.current) {
        ioRef.current.disconnect();
      }
    };
  }, [game, gameId]);

  if (!gameData || !ioRef.current) {
    return null;
  }

  if (gameData.players.some(({ status }) => status !== EPlayerStatus.PLAYING)) {
    return (
      <div>Ожидание игроков...</div>
    );
  }

  if (game === EGame.PEXESO) {
    return (
      <PexesoGame
        io={ioRef.current}
      />
    );
  }

  if (game === EGame.SURVIVAL_ONLINE) {
    return (
      <SurvivalOnlineGame
        io={ioRef.current}
      />
    );
  }

  return null;
};

export default React.memo(Game);
