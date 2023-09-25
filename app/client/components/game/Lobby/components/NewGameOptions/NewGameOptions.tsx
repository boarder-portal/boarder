import isEmpty from 'lodash/isEmpty';
import times from 'lodash/times';
import { ComponentType, useCallback, useMemo } from 'react';

import { DEFAULT_DESTROY_ON_LEAVE, DEFAULT_USE_BOTS, TEST_CASES } from 'common/constants/game';

import { WithClassName } from 'client/types/react';
import typedReactMemo from 'client/types/typedReactMemo';
import { GameOptions, GameType, TestCaseType } from 'common/types/game';

import { areBotsAvailable } from 'common/utilities/bots';

import { SetOptions } from 'client/components/game/Lobby/hooks/useGameOptions';

import Button from 'client/components/common/Button/Button';
import Checkbox from 'client/components/common/Checkbox/Checkbox';
import Flex from 'client/components/common/Flex/Flex';
import Select from 'client/components/common/Select/Select';
import Text from 'client/components/common/Text/Text';
import { CreateGameOptionsProps } from 'client/components/game/Lobby/Lobby';

import { DEFAULT_OPTIONS } from 'client/atoms/gameOptionsAtoms';

import styles from './NewGameOptions.module.scss';

interface NewGameOptionsProps<Game extends GameType> extends WithClassName {
  game: Game;
  options: GameOptions<Game>;
  setOptions: SetOptions<Game>;
  createGame(): void;
  renderCreateGameOptions?: ComponentType<CreateGameOptionsProps<Game>>;
}

export type ChangeOptions<Game extends GameType> = <K extends keyof GameOptions<Game>>(
  optionsChange: Pick<GameOptions<Game>, K>,
) => void;

const NewGameOptions = <Game extends GameType>(props: NewGameOptionsProps<Game>) => {
  const { className, game, options, setOptions, createGame, renderCreateGameOptions: CreateGameOptions } = props;

  const { minPlayersCount, maxPlayersCount } = DEFAULT_OPTIONS[game];
  const testCases = TEST_CASES[game];

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

  const createGameOptions = useMemo(() => {
    if (!CreateGameOptions) {
      return null;
    }

    return <CreateGameOptions options={options} changeOptions={changeOptions} />;
  }, [CreateGameOptions, changeOptions, options]);

  return (
    <Flex className={className} direction="column" between={3}>
      <Flex className={styles.optionsBlock} direction="column" between={6}>
        <Text size="l">Общие настройки</Text>

        <Flex direction="column" between={3}>
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
            checked={options.destroyOnLeave ?? DEFAULT_DESTROY_ON_LEAVE}
            label="Удалять при выходе всех игроков"
            onChange={handleDestroyOnLeaveChange}
          />

          {areBotsAvailable(game) && (
            <Checkbox
              checked={options.useBots ?? DEFAULT_USE_BOTS}
              label="Добавить ботов"
              onChange={handleUseBotsChange}
            />
          )}
        </Flex>
      </Flex>

      {createGameOptions && (
        <Flex className={styles.optionsBlock} direction="column" between={6}>
          <Text size="l">Настройки игры</Text>

          <Flex direction="column" between={3}>
            {createGameOptions}
          </Flex>
        </Flex>
      )}

      <Button className={styles.createGameButton} onClick={createGame}>
        Создать игру
      </Button>
    </Flex>
  );
};

export default typedReactMemo(NewGameOptions);
