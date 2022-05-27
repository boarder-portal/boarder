import React, { ComponentType, useCallback, useState } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import { unstable_batchedUpdates as batchedUpdates } from 'react-dom';

import { EGame, TGameInfo } from 'common/types/game';
import {
  ECommonGameClientEvent,
  ECommonGameServerEvent,
  EPlayerStatus,
  ICommonClientEventMap,
  ICommonServerEventMap,
  IGamePlayer,
} from 'common/types';
import { TGameClientSocket } from 'common/types/socket';

import Text from 'client/components/common/Text/Text';
import Flex from 'client/components/common/Flex/Flex';
import Button from 'client/components/common/Button/Button';
import PexesoGame from 'client/pages/Game/components/PexesoGame/PexesoGame';
import SurvivalOnlineGame from 'client/pages/Game/components/SurvivalOnlineGame/SurvivalOnlineGame';
import SetGame from 'client/pages/Game/components/SetGame/SetGame';
import OnitamaGame from 'client/pages/Game/components/OnitamaGame/OnitamaGame';
import CarcassonneGame from 'client/pages/Game/components/CarcassonneGame/CarcassonneGame';
import SevenWondersGame from 'client/pages/Game/components/SevenWondersGame/SevenWondersGame';
import HeartsGame from 'client/pages/Game/components/HeartsGame/HeartsGame';
import BombersGame from 'client/pages/Game/components/BombersGame/BombersGame';

import { useBoolean } from 'client/hooks/useBoolean';
import useSocket from 'client/hooks/useSocket';
import useAtom from 'client/hooks/useAtom';

import styles from './Game.pcss';

export interface IGameProps<Game extends EGame> {
  io: TGameClientSocket<Game>;
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
  [EGame.BOMBERS]: BombersGame,
};

function Game<G extends EGame>() {
  const { game, gameId } = useParams<{ game: G; gameId: string }>();

  const [gameName, setGameName] = useState<string | null>(null);
  const [gameInfo, setGameInfo] = useState<TGameInfo<G> | null>(null);
  const [players, setPlayers] = useState<IGamePlayer[]>([]);

  const { value: isGameEnd, setTrue: endGame } = useBoolean(false);

  const history = useHistory();
  const [user] = useAtom('user');

  const socket = useSocket<ICommonClientEventMap<G>, ICommonServerEventMap<G>>(`/${game}/game/${gameId}`, {
    [ECommonGameServerEvent.GET_DATA]: (data) => {
      batchedUpdates(() => {
        setGameInfo(data.info);
        setPlayers(data.players);
        setGameName(data.name);
      });
    },
    [ECommonGameServerEvent.GET_INFO]: (info) => {
      setGameInfo(info);
    },
    [ECommonGameServerEvent.UPDATE_PLAYERS]: (players) => {
      setPlayers(players);
    },
    [ECommonGameServerEvent.END]: () => {
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
    socket?.emit(ECommonGameClientEvent.TOGGLE_READY);
  }, [socket]);

  if (!socket || !gameName) {
    return null;
  }

  if (!gameInfo) {
    return (
      <div>
        <Text size="xxl" weight="bold">
          {gameName}
        </Text>

        <Flex className={styles.players} direction="column" between={3}>
          {players.map(({ login, status }) => (
            <Flex key={login} className={styles.user} alignItems="center">
              <div>{login}</div>
              <div className={styles.status}>{status === EPlayerStatus.NOT_READY ? 'Не готов' : 'Готов'}</div>

              {login === user?.login && (
                <Button
                  className={styles.changeReadyStatusButton}
                  variant={status === EPlayerStatus.NOT_READY ? 'contained' : 'outlined'}
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
