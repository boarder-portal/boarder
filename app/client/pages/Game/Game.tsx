import React, { ComponentType, useCallback, useState } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import { unstable_batchedUpdates as batchedUpdates } from 'react-dom';

import { EGame, TGameInfo, TGameOptions, TGameResult, TPlayerSettings } from 'common/types/game';
import {
  ECommonGameClientEvent,
  ECommonGameServerEvent,
  EPlayerStatus,
  ICommonClientEventMap,
  ICommonServerEventMap,
  IGamePlayer,
} from 'common/types';
import { TGameClientSocket } from 'common/types/socket';

import { now } from 'client/utilities/time';

import useSocket from 'client/hooks/useSocket';
import useAtom from 'client/hooks/useAtom';
import usePlayerSettings from 'client/hooks/usePlayerSettings';
import useImmutableCallback from 'client/hooks/useImmutableCallback';

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
import MachiKoroGame from 'client/pages/Game/components/MachiKoroGame/MachiKoroGame';
import MahjongGame from 'client/pages/Game/components/MahjongGame/MahjongGame';

import { DEFAULT_OPTIONS } from 'client/atoms/gameOptionsAtoms';

import styles from './Game.pcss';

export type TChangeSettingCallback<Game extends EGame> = <Key extends keyof TPlayerSettings<Game>>(
  key: Key,
  value: TPlayerSettings<Game>[Key],
) => void;

export interface IGameProps<Game extends EGame> {
  io: TGameClientSocket<Game>;
  gameOptions: TGameOptions<Game>;
  gameInfo: TGameInfo<Game>;
  gameResult: TGameResult<Game> | null;
  timeDiff: number;
  changeSetting: TChangeSettingCallback<Game>;
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
  [EGame.MACHI_KORO]: MachiKoroGame,
  [EGame.MAHJONG]: MahjongGame,
};

function Game<G extends EGame>() {
  const { game, gameId } = useParams<{ game: G; gameId: string }>();

  const [gameName, setGameName] = useState<string | null>(null);
  const [gameOptions, setGameOptions] = useState<TGameOptions<G>>(DEFAULT_OPTIONS[game]);
  const [gameInfo, setGameInfo] = useState<TGameInfo<G> | null>(null);
  const [gameResult, setGameResult] = useState<TGameResult<G> | null>(null);
  const [players, setPlayers] = useState<IGamePlayer<G>[]>([]);
  const [timeDiff, setTimeDiff] = useState(0);

  const history = useHistory();
  const [user] = useAtom('user');
  const { settings: playerSettings, changeSetting: onChangeSetting } = usePlayerSettings(game);

  const socket = useSocket<ICommonClientEventMap<G>, ICommonServerEventMap<G>>(
    `/${game}/game/${gameId}?settings=${JSON.stringify(playerSettings)}`,
    {
      [ECommonGameServerEvent.GET_DATA]: (data) => {
        batchedUpdates(() => {
          setGameOptions(data.options);
          setGameInfo(data.info);
          setGameResult(data.result);
          setPlayers(data.players);
          setGameName(data.name);
          setTimeDiff(data.timestamp - now());
        });
      },
      [ECommonGameServerEvent.GET_INFO]: (info) => {
        setGameInfo(info);
      },
      [ECommonGameServerEvent.UPDATE_PLAYERS]: (players) => {
        setPlayers(players);
      },
      [ECommonGameServerEvent.PING]: (serverTimestamp) => {
        setTimeDiff(serverTimestamp - now());
      },
      [ECommonGameServerEvent.END]: (result) => {
        console.log('GAME_END', result);

        setGameResult(result);
      },

      // eslint-disable-next-line camelcase
      connect_error: (err: Error) => {
        if (err.message === 'Invalid namespace') {
          history.push(`/${game}/lobby`);
        }
      },
    },
  );

  const handleUserClick = useCallback(() => {
    socket?.emit(ECommonGameClientEvent.TOGGLE_READY);
  }, [socket]);

  const changeSetting: TChangeSettingCallback<G> = useImmutableCallback((key, value) => {
    onChangeSetting(key, value);

    // @ts-ignore
    socket?.emit(ECommonGameClientEvent.CHANGE_SETTING, { key, value });
  });

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

  return (
    <Game
      io={socket}
      gameOptions={gameOptions}
      gameInfo={gameInfo}
      gameResult={gameResult}
      timeDiff={timeDiff}
      changeSetting={changeSetting}
    />
  );
}

export default React.memo(Game);
