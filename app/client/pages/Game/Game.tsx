import { ComponentType, memo, useCallback, useRef, useState } from 'react';
import { unstable_batchedUpdates as batchedUpdates } from 'react-dom';
import { useHistory, useParams } from 'react-router-dom';

import {
  CommonClientEventMap,
  CommonGameClientEvent,
  CommonGameServerEvent,
  CommonServerEventMap,
  GamePlayer,
  PlayerStatus,
} from 'common/types';
import { GameInfo, GameOptions, GameResult, GameState, GameType, PlayerSettings } from 'common/types/game';
import { GameClientSocket } from 'common/types/socket';

import { now } from 'client/utilities/time';

import useAtom from 'client/hooks/useAtom';
import useGlobalListener from 'client/hooks/useGlobalListener';
import useImmutableCallback from 'client/hooks/useImmutableCallback';
import usePlayerSettings from 'client/hooks/usePlayerSettings';
import useSocket from 'client/hooks/useSocket';

import Button from 'client/components/common/Button/Button';
import Flex from 'client/components/common/Flex/Flex';
import Modal from 'client/components/common/Modal/Modal';
import Text from 'client/components/common/Text/Text';
import BombersGame from 'client/pages/Game/components/BombersGame/BombersGame';
import CarcassonneGame from 'client/pages/Game/components/CarcassonneGame/CarcassonneGame';
import HeartsGame from 'client/pages/Game/components/HeartsGame/HeartsGame';
import MachiKoroGame from 'client/pages/Game/components/MachiKoroGame/MachiKoroGame';
import MahjongGame from 'client/pages/Game/components/MahjongGame/MahjongGame';
import OnitamaGame from 'client/pages/Game/components/OnitamaGame/OnitamaGame';
import PexesoGame from 'client/pages/Game/components/PexesoGame/PexesoGame';
import SetGame from 'client/pages/Game/components/SetGame/SetGame';
import SevenWondersGame from 'client/pages/Game/components/SevenWondersGame/SevenWondersGame';
import SurvivalOnlineGame from 'client/pages/Game/components/SurvivalOnlineGame/SurvivalOnlineGame';

import { DEFAULT_OPTIONS } from 'client/atoms/gameOptionsAtoms';
import { GameStateContext, TimeDiffContext } from 'client/pages/Game/contexts';

import styles from './Game.module.scss';

export type ChangeSettingCallback<Game extends GameType> = <Key extends keyof PlayerSettings<Game>>(
  key: Key,
  value: PlayerSettings<Game>[Key],
) => void;

export interface GameProps<Game extends GameType> {
  io: GameClientSocket<Game>;
  gameOptions: GameOptions<Game>;
  gameInfo: GameInfo<Game>;
  gameResult: GameResult<Game> | null;
  gameState: GameState;
  getTimeDiff(): number;
  changeSetting: ChangeSettingCallback<Game>;
}

const GAMES_MAP: {
  [Game in GameType]: ComponentType<GameProps<Game>>;
} = {
  [GameType.PEXESO]: PexesoGame,
  [GameType.SURVIVAL_ONLINE]: SurvivalOnlineGame,
  [GameType.SET]: SetGame,
  [GameType.ONITAMA]: OnitamaGame,
  [GameType.CARCASSONNE]: CarcassonneGame,
  [GameType.SEVEN_WONDERS]: SevenWondersGame,
  [GameType.HEARTS]: HeartsGame,
  [GameType.BOMBERS]: BombersGame,
  [GameType.MACHI_KORO]: MachiKoroGame,
  [GameType.MAHJONG]: MahjongGame,
};

const Game = <G extends GameType>() => {
  const { game, gameId } = useParams<{ game: G; gameId: string }>();

  const [gameName, setGameName] = useState<string | null>(null);
  const [gameOptions, setGameOptions] = useState<GameOptions<G>>(DEFAULT_OPTIONS[game]);
  const [gameInfo, setGameInfo] = useState<GameInfo<G> | null>(null);
  const [gameResult, setGameResult] = useState<GameResult<G> | null>(null);
  const [players, setPlayers] = useState<GamePlayer<G>[]>([]);
  const [timeDiff, setTimeDiff] = useState(0);
  const [gameState, setGameState] = useState<GameState>({
    type: 'active',
    changeTimestamp: 0,
  });

  const history = useHistory();
  const [user] = useAtom('user');
  const { settings: playerSettings, changeSetting: onChangeSetting } = usePlayerSettings(game);

  const socketPathRef = useRef(`/${game}/game/${gameId}?settings=${JSON.stringify(playerSettings)}`);

  const socket = useSocket<CommonClientEventMap<G>, CommonServerEventMap<G>>(socketPathRef.current, {
    [CommonGameServerEvent.GET_DATA]: (data) => {
      batchedUpdates(() => {
        const timeDiff = data.timestamp - now();

        setGameOptions(data.options);
        setGameInfo(data.info);
        setGameResult(data.result);
        setPlayers(data.players);
        setGameName(data.name);
        setTimeDiff(timeDiff);
        setGameState({
          type: data.state.type,
          changeTimestamp: data.state.changeTimestamp - timeDiff,
        });
      });
    },
    [CommonGameServerEvent.GET_INFO]: (info) => {
      setGameInfo(info);
    },
    [CommonGameServerEvent.UPDATE_PLAYERS]: (players) => {
      setPlayers(players);
    },
    [CommonGameServerEvent.PING]: (serverTimestamp) => {
      setTimeDiff(serverTimestamp - now());
    },
    [CommonGameServerEvent.PAUSE]: (pausedAt) => {
      setGameState({
        type: 'paused',
        changeTimestamp: pausedAt - timeDiff,
      });
    },
    [CommonGameServerEvent.UNPAUSE]: (pausedAt) => {
      setGameState({
        type: 'active',
        changeTimestamp: pausedAt - timeDiff,
      });
    },
    [CommonGameServerEvent.END]: (result) => {
      console.log('GAME_END', result);

      setGameResult(result);
    },

    // eslint-disable-next-line camelcase
    connect_error: (err: Error) => {
      if (err.message === 'Invalid namespace') {
        history.push(`/${game}/lobby`);
      }
    },
  });

  const handleUserClick = useCallback(() => {
    socket?.emit(CommonGameClientEvent.TOGGLE_READY);
  }, [socket]);

  const changeSetting: ChangeSettingCallback<G> = useImmutableCallback((key, value) => {
    onChangeSetting(key, value);

    // @ts-ignore
    socket?.emit(CommonGameClientEvent.CHANGE_SETTING, { key, value });
  });

  const getTimeDiff = useImmutableCallback(() => {
    return timeDiff;
  });

  useGlobalListener('keyup', typeof document === 'undefined' ? null : document, (e) => {
    if (e.code === 'KeyP') {
      socket?.emit(CommonGameClientEvent.TOGGLE_PAUSE);
    }
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
              <div className={styles.status}>{status === PlayerStatus.NOT_READY ? 'Не готов' : 'Готов'}</div>

              {login === user?.login && (
                <Button
                  className={styles.changeReadyStatusButton}
                  variant={status === PlayerStatus.NOT_READY ? 'contained' : 'outlined'}
                  onClick={handleUserClick}
                >
                  {status === PlayerStatus.NOT_READY ? 'Готов' : 'Не готов'}
                </Button>
              )}
            </Flex>
          ))}
        </Flex>
      </div>
    );
  }

  const Game: ComponentType<GameProps<G>> = GAMES_MAP[game];

  return (
    <TimeDiffContext.Provider value={getTimeDiff}>
      <GameStateContext.Provider value={gameState}>
        <Game
          io={socket}
          gameOptions={gameOptions}
          gameInfo={gameInfo}
          gameResult={gameResult}
          gameState={gameState}
          getTimeDiff={getTimeDiff}
          changeSetting={changeSetting}
        />

        <Modal containerClassName={styles.pauseModal} open={gameState.type === 'paused'}>
          Пауза
        </Modal>
      </GameStateContext.Provider>
    </TimeDiffContext.Provider>
  );
};

export default memo(Game);
