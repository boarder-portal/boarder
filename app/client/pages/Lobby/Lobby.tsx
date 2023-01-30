import React, { ComponentType, useCallback, useState } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import times from 'lodash/times';

import { GAME_NAMES } from 'common/constants/games/common';

import typedReactMemo from 'client/types/typedReactMemo';
import { EGame, TGameOptions } from 'common/types/game';
import { ELobbyEvent, ILobbyClientEventMap, ILobbyServerEventMap, ILobbyUpdateEvent } from 'common/types/lobby';

import { areBotsAvailable } from 'common/utilities/bots';

import useGameOptions from 'client/hooks/useGameOptions';
import useImmutableCallback from 'client/hooks/useImmutableCallback';
import useSocket from 'client/hooks/useSocket';

import LobbyGame from 'client/pages/Lobby/components/Game/Game';
import Text from 'client/components/common/Text/Text';
import Flex from 'client/components/common/Flex/Flex';
import Button from 'client/components/common/Button/Button';
import Select from 'client/components/common/Select/Select';
import Checkbox from 'client/components/common/Checkbox/Checkbox';
import PexesoCreateGameOptions from 'client/pages/games/pexeso/components/PexesoCreateGameOptions/PexesoCreateGameOptions';
import PexesoGameOptions from 'client/pages/games/pexeso/components/PexesoGameOptions/PexesoGameOptions';
import BombersCreateGameOptions from 'client/pages/games/bombers/components/BombersCreateGameOptions/BombersCreateGameOptions';
import BombersGameOptions from 'client/pages/games/bombers/components/BombersGameOptions/BombersGameOptions';
import MahjongCreateGameOptions from 'client/pages/games/mahjong/components/MahjongCreateGameOptions/MahjongCreateGameOptions';
import MahjongGameOptions from 'client/pages/games/mahjong/components/MahjongGameOptions/MahjongGameOptions';
import SevenWondersCreateGameOptions from 'client/pages/games/sevenWonders/components/SevenWondersCreateGameOptions/SevenWondersCreateGameOptions';
import SevenWondersGameOptions from 'client/pages/games/sevenWonders/components/SevenWondersGameOptions/SevenWondersGameOptions';

import { DEFAULT_OPTIONS } from 'client/atoms/gameOptionsAtoms';

import styles from './Lobby.pcss';

export type TChangeOptions<Game extends EGame> = <K extends keyof TGameOptions<Game>>(
  optionsChange: Pick<TGameOptions<Game>, K>,
) => void;

export interface ICreateGameOptionsProps<Game extends EGame> {
  options: TGameOptions<Game>;
  changeOptions: TChangeOptions<Game>;
}

export interface IGameOptionsProps<Game extends EGame> {
  options: TGameOptions<Game>;
}

const CREATE_GAME_OPTIONS_MAP: Partial<{
  [Game in EGame]: ComponentType<ICreateGameOptionsProps<Game>>;
}> = {
  [EGame.PEXESO]: PexesoCreateGameOptions,
  [EGame.SEVEN_WONDERS]: SevenWondersCreateGameOptions,
  [EGame.BOMBERS]: BombersCreateGameOptions,
  [EGame.MAHJONG]: MahjongCreateGameOptions,
};

const GAME_OPTIONS_MAP: Partial<{
  [Game in EGame]: ComponentType<IGameOptionsProps<Game>>;
}> = {
  [EGame.PEXESO]: PexesoGameOptions,
  [EGame.SEVEN_WONDERS]: SevenWondersGameOptions,
  [EGame.BOMBERS]: BombersGameOptions,
  [EGame.MAHJONG]: MahjongGameOptions,
};

const Lobby = <Game extends EGame>() => {
  const { game } = useParams<{ game: Game; gameId: string }>();

  const [lobby, setLobby] = useState<ILobbyUpdateEvent<Game> | null>(null);

  const history = useHistory();
  const { options, setOptions, refreshDefaultOptions } = useGameOptions(game);

  const navigateToGame = useImmutableCallback((gameId: string) => {
    history.push(`/${game}/game/${gameId}`);
  });

  const socket = useSocket<ILobbyClientEventMap<Game>, ILobbyServerEventMap<Game>>(`/${game}/lobby`, {
    [ELobbyEvent.UPDATE]: (lobbyData) => {
      setLobby(lobbyData);
    },
    [ELobbyEvent.GAME_CREATED]: navigateToGame,
  });

  const createGame = useCallback(() => {
    // @ts-ignore
    socket?.emit(ELobbyEvent.CREATE_GAME, options);

    refreshDefaultOptions();
  }, [options, refreshDefaultOptions, socket]);

  const changeOptions: TChangeOptions<Game> = useCallback(
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

  const handleUseBotsChange = useCallback(
    (useBots: boolean) => {
      changeOptions({
        useBots,
      });
    },
    [changeOptions],
  );

  if (!lobby) {
    return null;
  }

  const { minPlayersCount, maxPlayersCount } = DEFAULT_OPTIONS[game];

  const CreateGameOptions = CREATE_GAME_OPTIONS_MAP[game] as ComponentType<ICreateGameOptionsProps<Game>> | undefined;
  const GameOptions = GAME_OPTIONS_MAP[game] as ComponentType<IGameOptionsProps<Game>>;

  const showPlayerCounts = minPlayersCount !== maxPlayersCount;
  const showBotsSettings = areBotsAvailable(game);

  return (
    <div>
      <Text size="xxl" weight="bold">
        {GAME_NAMES[game]}
      </Text>

      <Flex className={styles.gamesAndOptions}>
        <Flex className={styles.games} direction="column" between={3}>
          {lobby.games.length ? (
            lobby.games.map((game) => (
              <LobbyGame
                key={game.id}
                title={game.name}
                options={GameOptions && <GameOptions options={game.options} />}
                players={game.players.length}
                maxPlayers={game.options.maxPlayersCount}
                hasStarted={game.hasStarted}
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
          {(showPlayerCounts || showBotsSettings || CreateGameOptions) && <Text size="xxl">Настройки игры</Text>}

          {showPlayerCounts && (
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

          {showBotsSettings && (
            <Checkbox checked={options.useBots ?? false} label="Добавить ботов" onChange={handleUseBotsChange} />
          )}

          {CreateGameOptions && <CreateGameOptions options={options} changeOptions={changeOptions} />}

          <Button onClick={createGame}>Создать игру</Button>
        </Flex>
      </Flex>
    </div>
  );
};

export default typedReactMemo(Lobby);
