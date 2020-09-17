import React, { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import io from 'socket.io-client';
import { useRecoilValue } from 'recoil';

import { EGame, EPlayerStatus } from 'common/types';
import { EGameEvent, IGame } from 'common/types/game';

import userAtom from 'client/atoms/userAtom';
import PexesoGame from 'client/pages/Game/PexesoGame/PexesoGame';

const Game: React.FC = () => {
  const { game, gameId } = useParams<{ game: EGame; gameId: string }>();
  const ioRef = useRef<SocketIOClient.Socket>();

  const [gameData, setGameData] = useState<IGame | null>(null);

  const user = useRecoilValue(userAtom);

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

  if (!gameData || !user || !ioRef.current) {
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

  return null;
};

export default React.memo(Game);
