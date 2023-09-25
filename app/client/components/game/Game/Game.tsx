import { ComponentType, memo, useCallback, useMemo, useRef, useState } from 'react';
import { unstable_batchedUpdates as batchedUpdates } from 'react-dom';
import { useHistory, useParams } from 'react-router-dom';

import {
  BaseGamePlayer,
  CommonClientEventMap,
  CommonGameClientEvent,
  CommonGameServerEvent,
  CommonServerEventMap,
  PlayerStatus,
} from 'common/types';
import { GameInfo, GameOptions, GameResult, GameState, GameType } from 'common/types/game';
import { GameClientSocket } from 'common/types/socket';

import { now } from 'client/utilities/time';

import useAtom from 'client/hooks/useAtom';
import useGlobalListener from 'client/hooks/useGlobalListener';
import useImmutableCallback from 'client/hooks/useImmutableCallback';
import useLocalPlayerSettings from 'client/hooks/useLocalPlayerSettings';
import usePlayer from 'client/hooks/usePlayer';
import useSocket from 'client/hooks/useSocket';

import Button from 'client/components/common/Button/Button';
import Flex from 'client/components/common/Flex/Flex';
import Overlay from 'client/components/common/Overlay/Overlay';
import Text from 'client/components/common/Text/Text';
import {
  GameStateContext,
  PlayerSettingsContext,
  PlayerSettingsContexts,
  TimeDiffContext,
} from 'client/components/game/Game/contexts';
import BombersGame from 'client/components/games/bombers/BombersGame/components/GameContent/GameContent';
import CarcassonneGame from 'client/components/games/carcassonne/CarcassonneGame/components/GameContent/GameContent';
import HeartsGame from 'client/components/games/hearts/HeartsGame/components/GameContent/GameContent';
import MachiKoroGame from 'client/components/games/machiKoro/MachiKoroGame/components/GameContent/GameContent';
import MahjongGame from 'client/components/games/mahjong/MahjongGame/components/GameContent/GameContent';
import OnitamaGame from 'client/components/games/onitama/OnitamaGame/components/GameContent/GameContent';
import PexesoGame from 'client/components/games/pexeso/PexesoGame/components/GameContent/GameContent';
import RedSevenGame from 'client/components/games/redSeven/RedSevenGame/components/GameContent/GameContent';
import SetGame from 'client/components/games/set/SetGame/components/GameContent/GameContent';
import SevenWondersGame from 'client/components/games/sevenWonders/SevenWondersGame/components/GameContent/GameContent';
import SurvivalOnlineGame from 'client/components/games/survivalOnline/SurvivalOnlineGame/components/GameContent/GameContent';

import { DEFAULT_OPTIONS } from 'client/atoms/gameOptionsAtoms';

import styles from './Game.module.scss';

export interface GameProps<Game extends GameType> {
  io: GameClientSocket<Game>;
  gameOptions: GameOptions<Game>;
  gameInfo: GameInfo<Game>;
  gameResult: GameResult<Game> | null;
  gameState: GameState;
  getTimeDiff(): number;
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
  [GameType.RED_SEVEN]: RedSevenGame,
};

const Game = <G extends GameType>() => {
  const { game, gameId } = useParams<{ game: G; gameId: string }>();

  const [gameName, setGameName] = useState<string | null>(null);
  const [gameOptions, setGameOptions] = useState<GameOptions<G>>(DEFAULT_OPTIONS[game]);
  const [gameInfo, setGameInfo] = useState<GameInfo<G> | null>(null);
  const [gameResult, setGameResult] = useState<GameResult<G> | null>(null);
  const [players, setPlayers] = useState<BaseGamePlayer<G>[]>([]);
  const [timeDiff, setTimeDiff] = useState(0);
  const [gameState, setGameState] = useState<GameState>({
    type: 'active',
    changeTimestamp: 0,
  });

  const history = useHistory();
  const [user] = useAtom('user');
  const player = usePlayer(players);
  const { settings: localPlayerSettings, changeSetting: onChangeSetting } = useLocalPlayerSettings(game);

  const socketPathRef = useRef(`/${game}/game/${gameId}?settings=${JSON.stringify(localPlayerSettings)}`);

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

  const changeSetting: PlayerSettingsContext<G>['changeSetting'] = useImmutableCallback((key, value) => {
    onChangeSetting(key, value);

    // @ts-ignore
    socket?.emit(CommonGameClientEvent.CHANGE_SETTING, { key, value });
  });

  const getTimeDiff = useImmutableCallback(() => {
    return timeDiff;
  });

  const playerSettingsContext = useMemo<PlayerSettingsContext<G>>(() => {
    return {
      settings: player?.settings ?? localPlayerSettings,
      changeSetting,
    };
  }, [changeSetting, localPlayerSettings, player?.settings]);

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
  const PlayerSettingsContext = PlayerSettingsContexts[game];

  return (
    <PlayerSettingsContext.Provider value={playerSettingsContext}>
      <TimeDiffContext.Provider value={getTimeDiff}>
        <GameStateContext.Provider value={gameState}>
          <Game
            io={socket}
            gameOptions={gameOptions}
            gameInfo={gameInfo}
            gameResult={gameResult}
            gameState={gameState}
            getTimeDiff={getTimeDiff}
          />

          <Overlay contentClassName={styles.pauseContent} open={gameState.type === 'paused'}>
            Пауза
          </Overlay>
        </GameStateContext.Provider>
      </TimeDiffContext.Provider>
    </PlayerSettingsContext.Provider>
  );
};

export default memo(Game);
