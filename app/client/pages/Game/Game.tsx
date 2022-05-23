import React, { ComponentType, useCallback, useState } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import { Socket } from 'socket.io-client';
import { useRecoilValue } from 'recoil';

import { EGame, ECommonGameEvent, TGameSocketEventMap, TGameInfo, ICommonEventMap } from 'common/types/game';
import { EPlayerStatus, IGamePlayer } from 'common/types';

import PexesoGame from 'client/pages/Game/components/PexesoGame/PexesoGame';
import SurvivalOnlineGame from 'client/pages/Game/components/SurvivalOnlineGame/SurvivalOnlineGame';
import SetGame from 'client/pages/Game/components/SetGame/SetGame';
import OnitamaGame from 'client/pages/Game/components/OnitamaGame/OnitamaGame';
import CarcassonneGame from 'client/pages/Game/components/CarcassonneGame/CarcassonneGame';
import SevenWondersGame from 'client/pages/Game/components/SevenWondersGame/SevenWondersGame';
import HeartsGame from 'client/pages/Game/components/HeartsGame/HeartsGame';
import Text from 'client/components/common/Text/Text';
import Flex from 'client/components/common/Flex/Flex';
import Button from 'client/components/common/Button/Button';

import { useBoolean } from 'client/hooks/useBoolean';
import useSocket from 'client/hooks/useSocket';
import userAtom from 'client/atoms/userAtom';

import styles from './Game.pcss';

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
  const [players, setPlayers] = useState<IGamePlayer[]>([]);

  const { value: isGameEnd, setTrue: endGame } = useBoolean(false);

  const history = useHistory();
  const user = useRecoilValue(userAtom);

  const socket = useSocket<ICommonEventMap<G>>(`/${game}/game/${gameId}`, {
    [ECommonGameEvent.GET_DATA]: (data) => {
      setGameInfo(data.info);
      setPlayers(data.players);
    },
    [ECommonGameEvent.GET_INFO as any]: (info: TGameInfo<G>) => {
      setGameInfo(info);
    },
    [ECommonGameEvent.UPDATE_PLAYERS]: (players) => {
      setPlayers(players);
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

  const handleUserClick = useCallback(() => {
    socket?.emit(ECommonGameEvent.TOGGLE_READY);
  }, [socket]);

  if (!socket) {
    return null;
  }

  if (!gameInfo) {
    return (
      <div>
        <Text size="xxl" weight="bold">
          Игра {game}
        </Text>

        <Flex className={styles.players} direction="column" between={3}>
          {players.map(({ login, status }) => (
            <Flex key={login} className={styles.user} alignItems="center">
              <div>{login}</div>
              <div className={styles.status}>{status === EPlayerStatus.NOT_READY ? 'Не готов' : 'Готов'}</div>

              {login === user?.login && (
                <Button
                  className={styles.changeReadyStatusButton}
                  type={status === EPlayerStatus.NOT_READY ? 'primary' : 'secondary'}
                  onClick={handleUserClick}
                >
                  {status === EPlayerStatus.NOT_READY ? 'Готов' : 'Не готов'}
                </Button>
              )}
            </Flex>
          ))}
        </Flex>
      </div>
    );
  }

  const Game: ComponentType<IGameProps<G>> = GAMES_MAP[game];

  return <Game io={socket} isGameEnd={isGameEnd} gameInfo={gameInfo} />;
}

export default React.memo(Game);
