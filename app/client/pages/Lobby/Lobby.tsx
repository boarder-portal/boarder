import isEmpty from 'lodash/isEmpty';
import times from 'lodash/times';
import { ComponentType, useCallback, useState } from 'react';
import { useHistory, useParams } from 'react-router-dom';

import { GAME_NAMES, TEST_CASES } from 'common/constants/game';

import typedReactMemo from 'client/types/typedReactMemo';
import { GameOptions, GameType, TestCaseType } from 'common/types/game';
import { LobbyClientEventMap, LobbyEventType, LobbyServerEventMap, LobbyUpdateEvent } from 'common/types/game/lobby';

import { areBotsAvailable } from 'common/utilities/bots';

import useGameOptions from 'client/hooks/useGameOptions';
import useImmutableCallback from 'client/hooks/useImmutableCallback';
import useSocket from 'client/hooks/useSocket';

import Button from 'client/components/common/Button/Button';
import Checkbox from 'client/components/common/Checkbox/Checkbox';
import Flex from 'client/components/common/Flex/Flex';
import Select from 'client/components/common/Select/Select';
import Text from 'client/components/common/Text/Text';
import LobbyGame from 'client/pages/Lobby/components/Game/Game';
import BombersCreateGameOptions from 'client/pages/games/bombers/components/BombersCreateGameOptions/BombersCreateGameOptions';
import BombersGameOptions from 'client/pages/games/bombers/components/BombersGameOptions/BombersGameOptions';
import MahjongCreateGameOptions from 'client/pages/games/mahjong/components/MahjongCreateGameOptions/MahjongCreateGameOptions';
import MahjongGameOptions from 'client/pages/games/mahjong/components/MahjongGameOptions/MahjongGameOptions';
import PexesoCreateGameOptions from 'client/pages/games/pexeso/components/PexesoCreateGameOptions/PexesoCreateGameOptions';
import PexesoGameOptions from 'client/pages/games/pexeso/components/PexesoGameOptions/PexesoGameOptions';
import SevenWondersCreateGameOptions from 'client/pages/games/sevenWonders/components/SevenWondersCreateGameOptions/SevenWondersCreateGameOptions';
import SevenWondersGameOptions from 'client/pages/games/sevenWonders/components/SevenWondersGameOptions/SevenWondersGameOptions';

import { DEFAULT_OPTIONS } from 'client/atoms/gameOptionsAtoms';

import styles from './Lobby.module.scss';

export type ChangeOptions<Game extends GameType> = <K extends keyof GameOptions<Game>>(
  optionsChange: Pick<GameOptions<Game>, K>,
) => void;

export interface CreateGameOptionsProps<Game extends GameType> {
  options: GameOptions<Game>;
  changeOptions: ChangeOptions<Game>;
}

export interface GameOptionsProps<Game extends GameType> {
  options: GameOptions<Game>;
}

const CREATE_GAME_OPTIONS_MAP: Partial<{
  [Game in GameType]: ComponentType<CreateGameOptionsProps<Game>>;
}> = {
  [GameType.PEXESO]: PexesoCreateGameOptions,
  [GameType.SEVEN_WONDERS]: SevenWondersCreateGameOptions,
  [GameType.BOMBERS]: BombersCreateGameOptions,
  [GameType.MAHJONG]: MahjongCreateGameOptions,
};

const GAME_OPTIONS_MAP: Partial<{
  [Game in GameType]: ComponentType<GameOptionsProps<Game>>;
}> = {
  [GameType.PEXESO]: PexesoGameOptions,
  [GameType.SEVEN_WONDERS]: SevenWondersGameOptions,
  [GameType.BOMBERS]: BombersGameOptions,
  [GameType.MAHJONG]: MahjongGameOptions,
};

const Lobby = <Game extends GameType>() => {
  const { game } = useParams<{ game: Game; gameId: string }>();

  const [lobby, setLobby] = useState<LobbyUpdateEvent<Game> | null>(null);

  const history = useHistory();
  const { options, setOptions, refreshDefaultOptions } = useGameOptions(game);

  const testCases = TEST_CASES[game];

  const navigateToGame = useImmutableCallback((gameId: string) => {
    history.push(`/${game}/game/${gameId}`);
  });

  const socket = useSocket<LobbyClientEventMap<Game>, LobbyServerEventMap<Game>>(`/${game}/lobby`, {
    [LobbyEventType.UPDATE]: (lobbyData) => {
      setLobby(lobbyData);
    },
    [LobbyEventType.GAME_CREATED]: navigateToGame,
  });

  const createGame = useCallback(() => {
    // @ts-ignore
    socket?.emit(LobbyEventType.CREATE_GAME, options);

    refreshDefaultOptions();
  }, [options, refreshDefaultOptions, socket]);

  const changeOptions: ChangeOptions<Game> = useCallback(
    (optionsChange) => {
      setOptions((options) => ({
        ...options,
        ...optionsChange,
      }));
    },
    [setOptions],
  );

  const handleMinPlayersCountChange = useCallback(
    (minPlayersCount: number) => {
      changeOptions({
        minPlayersCount,
      });
    },
    [changeOptions],
  );

  const handleMaxPlayersCountChange = useCallback(
    (maxPlayersCount: number) => {
      changeOptions({
        maxPlayersCount,
      });
    },
    [changeOptions],
  );

  const handleTestCaseChange = useCallback(
    (testCaseType: TestCaseType<Game> | '') => {
      changeOptions({
        testCaseType: testCaseType || undefined,
      });
    },
    [changeOptions],
  );

  const handleUseBotsChange = useCallback(
    (useBots: boolean) => {
      changeOptions({
        useBots,
      });
    },
    [changeOptions],
  );

  const handleDestroyOnLeaveChange = useCallback(
    (destroyOnLeave: boolean) => {
      changeOptions({
        destroyOnLeave,
      });
    },
    [changeOptions],
  );

  if (!lobby) {
    return null;
  }

  const { minPlayersCount, maxPlayersCount } = DEFAULT_OPTIONS[game];

  const CreateGameOptions = CREATE_GAME_OPTIONS_MAP[game] as ComponentType<CreateGameOptionsProps<Game>> | undefined;
  const GameOptions = GAME_OPTIONS_MAP[game] as ComponentType<GameOptionsProps<Game>>;

  return (
    <div>
      <Text size="xxl" weight="bold">
        {GAME_NAMES[game]}
      </Text>

      <Flex className={styles.gamesAndOptions} between={10}>
        <Flex className={styles.games} direction="column" between={3}>
          {lobby.games.length ? (
            lobby.games.map((game) => (
              <LobbyGame
                key={game.id}
                title={game.name}
                options={GameOptions && <GameOptions options={game.options} />}
                players={game.players.length}
                maxPlayers={game.options.maxPlayersCount}
                status={game.status}
                onClick={() => navigateToGame(game.id)}
              />
            ))
          ) : (
            <Flex className={styles.games} alignItems="center" justifyContent="center">
              <Text size="xl">Игр пока нет</Text>
            </Flex>
          )}
        </Flex>

        <Flex className={styles.options} direction="column" between={3}>
          <Text size="xxl">Настройки игры</Text>

          <Flex className={styles.optionsBlock} direction="column" between={3}>
            {minPlayersCount !== maxPlayersCount && (
              <>
                <Select
                  label="Минимальное количество игроков"
                  value={options.minPlayersCount}
                  options={times(maxPlayersCount - minPlayersCount + 1, (index) => {
                    const value = minPlayersCount + index;

                    return {
                      value,
                      text: value,
                      disabled: value > options.maxPlayersCount,
                    };
                  })}
                  onChange={handleMinPlayersCountChange}
                />

                <Select
                  label="Максимальное количество игроков"
                  value={options.maxPlayersCount}
                  options={times(maxPlayersCount - minPlayersCount + 1, (index) => {
                    const value = minPlayersCount + index;

                    return {
                      value,
                      text: value,
                      disabled: value < options.minPlayersCount,
                    };
                  })}
                  onChange={handleMaxPlayersCountChange}
                />
              </>
            )}

            {process.env.NODE_ENV !== 'production' && testCases && !isEmpty(testCases) && (
              <Select
                label="Тестовый сценарий"
                value={options.testCaseType ?? ''}
                options={['' as const, ...Object.values(testCases)].map((testCaseType) => ({
                  value: testCaseType,
                  text: testCaseType || 'Отсутствует',
                }))}
                onChange={handleTestCaseChange}
              />
            )}

            <Checkbox
              checked={options.destroyOnLeave ?? true}
              label="Удалять при выходе всех игроков"
              onChange={handleDestroyOnLeaveChange}
            />

            {areBotsAvailable(game) && (
              <Checkbox checked={options.useBots ?? false} label="Добавить ботов" onChange={handleUseBotsChange} />
            )}
          </Flex>

          {CreateGameOptions && (
            <Flex className={styles.optionsBlock} direction="column" between={3}>
              <CreateGameOptions options={options} changeOptions={changeOptions} />
            </Flex>
          )}

          <Button onClick={createGame}>Создать игру</Button>
        </Flex>
      </Flex>
    </div>
  );
};

export default typedReactMemo(Lobby);
