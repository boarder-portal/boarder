import { ComponentType, useCallback, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import typedReactMemo from 'client/types/typedReactMemo';
import {
  BaseGamePlayer,
  CommonClientEventMap,
  CommonGameClientEvent,
  CommonGameServerEvent,
  CommonServerEventMap,
} from 'common/types';
import { GameInfo, GameOptions, GameResult, GameState, GameStatus, GameType } from 'common/types/game';
import { GameClientSocket } from 'common/types/socket';

import { now } from 'common/utilities/time';

import useGlobalListener from 'client/hooks/useGlobalListener';
import useImmutableCallback from 'client/hooks/useImmutableCallback';
import useLocalPlayerSettings from 'client/hooks/useLocalPlayerSettings';
import usePlayer from 'client/hooks/usePlayer';
import useSocket from 'client/hooks/useSocket';

import WaitingRoom from 'client/components/game/Game/components/WaitingRoom/WaitingRoom';
import {
  GameStateContext,
  PlayerSettingsContext,
  PlayerSettingsContexts,
  TimeDiffContext,
} from 'client/components/game/Game/contexts';

import { DEFAULT_OPTIONS } from 'client/atoms/gameOptionsAtoms';

export interface GameProps<Game extends GameType> {
  game: Game;
  renderGameContent: ComponentType<GameContentProps<Game>>;
  renderGameEnd?: ComponentType<GameEndProps<Game>>;
}

export interface GameContentProps<Game extends GameType> {
  io: GameClientSocket<Game>;
  gameOptions: GameOptions<Game>;
  gameInfo: GameInfo<Game>;
  gameResult: GameResult<Game> | null;
  gameState: GameState;
}

export interface GameEndProps<Game extends GameType> {
  gameResult: GameResult<Game> | null;
}

const Game = <Game extends GameType>(props: GameProps<Game>) => {
  const { game, renderGameContent: GameContent, renderGameEnd: GameEnd } = props;

  const { gameId } = useParams();

  const [gameName, setGameName] = useState<string | null>(null);
  const [gameOptions, setGameOptions] = useState<GameOptions<Game>>(DEFAULT_OPTIONS[game]);
  const [gameInfo, setGameInfo] = useState<GameInfo<Game> | null>(null);
  const [gameResult, setGameResult] = useState<GameResult<Game> | null>(null);
  const [players, setPlayers] = useState<BaseGamePlayer<Game>[]>([]);
  const [timeDiff, setTimeDiff] = useState(0);
  const [gameState, setGameState] = useState<GameState>({
    type: 'active',
    changeTimestamp: 0,
  });
  const [gameStatus, setGameStatus] = useState<GameStatus>(GameStatus.WAITING);

  const navigate = useNavigate();
  const player = usePlayer(players);
  const { settings: localPlayerSettings, changeSetting: onChangeSetting } = useLocalPlayerSettings(game);

  const socketPathRef = useRef(`/${game}/game/${gameId}?settings=${JSON.stringify(localPlayerSettings)}`);

  const socket = useSocket<CommonClientEventMap<Game>, CommonServerEventMap<Game>>(socketPathRef.current, {
    [CommonGameServerEvent.GET_DATA]: (data) => {
      const timeDiff = data.timestamp - now();

      setGameOptions(data.options);
      setGameInfo(data.info);
      setGameResult(data.result);
      setPlayers(data.players);
      setGameName(data.name);
      setTimeDiff(timeDiff);
      setGameState({
        ...data.state,
        changeTimestamp: data.state.changeTimestamp - timeDiff,
      });
      setGameStatus(data.status);
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
    [CommonGameServerEvent.UPDATE_STATE]: (gameState) => {
      setGameState({
        ...gameState,
        changeTimestamp: gameState.changeTimestamp - timeDiff,
      });
    },
    [CommonGameServerEvent.END]: (result) => {
      console.log('GAME_END', result);

      setGameResult(result);
    },

    // eslint-disable-next-line camelcase
    connect_error: (err: Error) => {
      if (err.message === 'Invalid namespace') {
        navigate(`/${game}/lobby`, { replace: true });
      }
    },
  });

  const toggleReady = useCallback(() => {
    socket?.emit(CommonGameClientEvent.TOGGLE_READY);
  }, [socket]);

  const changeSetting: PlayerSettingsContext<Game>['changeSetting'] = useImmutableCallback((key, value) => {
    onChangeSetting(key, value);

    // @ts-ignore
    socket?.emit(CommonGameClientEvent.CHANGE_SETTING, { key, value });
  });

  const getTimeDiff = useImmutableCallback(() => timeDiff);

  const playerSettingsContext = useMemo<PlayerSettingsContext<Game>>(() => {
    return {
      settings: player?.settings ?? localPlayerSettings,
      changeSetting,
    };
  }, [changeSetting, localPlayerSettings, player?.settings]);

  const gameEnd = useMemo(() => {
    if (!GameEnd || !gameInfo) {
      return null;
    }

    return <GameEnd gameResult={gameResult} />;
  }, [GameEnd, gameInfo, gameResult]);

  useGlobalListener('keyup', typeof document === 'undefined' ? null : document, (e) => {
    if (e.code === 'KeyP') {
      socket?.emit(gameState.type === 'paused' ? CommonGameClientEvent.UNPAUSE : CommonGameClientEvent.PAUSE);
    }
  });

  if (!socket || !gameName) {
    return null;
  }

  const PlayerSettingsContext = PlayerSettingsContexts[game];

  return (
    <PlayerSettingsContext.Provider value={playerSettingsContext}>
      <TimeDiffContext.Provider value={getTimeDiff}>
        <GameStateContext.Provider value={gameState}>
          {gameStatus === GameStatus.WAITING ? (
            <WaitingRoom gameName={gameName} players={players} toggleReady={toggleReady} />
          ) : (
            (gameStatus === GameStatus.GAME_ENDED && gameEnd) ||
            (gameInfo && (
              <GameContent
                io={socket}
                gameOptions={gameOptions}
                gameInfo={gameInfo}
                gameResult={gameResult}
                gameState={gameState}
              />
            ))
          )}
        </GameStateContext.Provider>
      </TimeDiffContext.Provider>
    </PlayerSettingsContext.Provider>
  );
};

export default typedReactMemo(Game);
