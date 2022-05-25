import React, { useCallback, useMemo, useState } from 'react';
import { useHistory } from 'react-router-dom';
import times from 'lodash/times';

import { GAME_NAMES } from 'common/constants/games/common';

import typedReactMemo from 'client/types/typedReactMemo';
import { EGame, TGameOptions } from 'common/types/game';
import { ELobbyEvent, ILobbyClientEventMap, ILobbyServerEventMap, ILobbyUpdateEvent } from 'common/types/lobby';

import LobbyGame from 'client/components/Lobby/components/Game/Game';
import Text from 'client/components/common/Text/Text';
import Flex from 'client/components/common/Flex/Flex';
import Button from 'client/components/common/Button/Button';
import Select from 'client/components/common/Select/Select';

import useGameOptions from 'client/hooks/useGameOptions';
import useImmutableCallback from 'client/hooks/useImmutableCallback';
import useSocket from 'client/hooks/useSocket';
import { DEFAULT_OPTIONS } from 'client/atoms/gameOptionsAtoms';

import styles from './Lobby.pcss';

export type TChangeOptions<Game extends EGame> = <K extends keyof TGameOptions<Game>>(
  optionsChange: Pick<TGameOptions<Game>, K>,
) => void;

export type TRenderOptions<Game extends EGame> = (
  options: TGameOptions<Game>,
  changeOptions: TChangeOptions<Game>,
) => React.ReactNode;

export type TRenderGameOptions<Game extends EGame> = (options: TGameOptions<Game>) => React.ReactNode;

interface ILobbyProps<Game extends EGame> {
  game: Game;
  renderOptions?: TRenderOptions<Game>;
  renderGameOptions?: TRenderGameOptions<Game>;
}

const Lobby = <Game extends EGame>(props: ILobbyProps<Game>) => {
  const { game, renderOptions, renderGameOptions } = props;

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

  const optionsNode = useMemo(() => {
    return renderOptions?.(options, changeOptions);
  }, [changeOptions, options, renderOptions]);

  if (!lobby) {
    return null;
  }

  const { minPlayersCount, maxPlayersCount } = DEFAULT_OPTIONS[game];

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
                options={renderGameOptions?.(game.options)}
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

        <Flex className={styles.options} direction="column" between={4}>
          <Text size="xxl">Настройки игры</Text>

          {minPlayersCount !== maxPlayersCount && (
            <>
              <Select
                label="Минимальное количество игроков"
                name="minPlayersCount"
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
                name="maxPlayersCount"
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

          {optionsNode}

          <Button onClick={createGame}>Создать игру</Button>
        </Flex>
      </Flex>
    </div>
  );
};

export default typedReactMemo(Lobby);
