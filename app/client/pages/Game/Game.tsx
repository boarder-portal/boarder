import React, { useEffect, useRef, useState } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import io, { Socket } from 'socket.io-client';

import { EPlayerStatus } from 'common/types';
import { EGame, ECommonGameEvent, IGameUpdateEvent, TGameSocketEventMap } from 'common/types/game';
import { IPlayer as ISurvivalOnlinePlayer } from 'common/types/survivalOnline';
import { IPlayer as ISetPlayer } from 'common/types/set';

import PexesoGame from 'client/pages/Game/components/PexesoGame/PexesoGame';
import SurvivalOnlineGame from 'client/pages/Game/components/SurvivalOnlineGame/SurvivalOnlineGame';
import SetGame from 'client/pages/Game/components/SetGame/SetGame';
import OnitamaGame from 'client/pages/Game/components/OnitamaGame/OnitamaGame';
import CarcassonneGame from 'client/pages/Game/components/CarcassonneGame/CarcassonneGame';
import SevenWondersGame from 'client/pages/Game/components/SevenWondersGame/SevenWondersGame';
import HeartsGame from 'client/pages/Game/components/HeartsGame/HeartsGame';

import { useBoolean } from 'client/hooks/useBoolean';

export interface IGameProps<Game extends EGame> {
  io: Socket<TGameSocketEventMap<Game>>;
  isGameEnd: boolean;
}

const Game: React.FC = () => {
  const { game, gameId } = useParams<{ game: EGame; gameId: string }>();
  const ioRef = useRef<Socket>();

  const [gameData, setGameData] = useState<IGameUpdateEvent | null>(null);

  const { value: isGameEnd, setTrue: endGame } = useBoolean(false);

  const history = useHistory();

  useEffect(() => {
    const socket = (ioRef.current = io(`/${game}/game/${gameId}`));

    socket.on(ECommonGameEvent.UPDATE, (updatedGameData: IGameUpdateEvent) => {
      setGameData(updatedGameData);
    });

    socket.on(ECommonGameEvent.END, () => {
      console.log('GAME_END');

      endGame();
    });

    socket.on('connect_error', (err) => {
      if (err.message === 'Invalid namespace') {
        history.push(`/${game}/lobby`);
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [endGame, game, gameId, history]);

  if (!gameData || !ioRef.current) {
    return null;
  }

  if (
    gameData.players.some(({ status }) => status !== EPlayerStatus.PLAYING && status !== EPlayerStatus.DISCONNECTED)
  ) {
    return <div>Ожидание игроков...</div>;
  }

  if (game === EGame.PEXESO) {
    return <PexesoGame io={ioRef.current} isGameEnd={isGameEnd} />;
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

  if (game === EGame.SET) {
    return <SetGame io={ioRef.current} players={gameData.players as ISetPlayer[]} isGameEnd={isGameEnd} />;
  }

  if (game === EGame.ONITAMA) {
    return <OnitamaGame io={ioRef.current} isGameEnd={isGameEnd} />;
  }

  if (game === EGame.CARCASSONNE) {
    return <CarcassonneGame io={ioRef.current} isGameEnd={isGameEnd} />;
  }

  if (game === EGame.SEVEN_WONDERS) {
    return <SevenWondersGame io={ioRef.current} isGameEnd={isGameEnd} />;
  }

  if (game === EGame.HEARTS) {
    return <HeartsGame io={ioRef.current} isGameEnd={isGameEnd} />;
  }

  return null;
};

export default React.memo(Game);
