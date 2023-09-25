import classNames from 'classnames';
import { ComponentType, useCallback, useMemo } from 'react';

import { WithClassName } from 'client/types/react';
import typedReactMemo from 'client/types/typedReactMemo';
import { GameStatus, GameType } from 'common/types/game';
import { LobbyGame } from 'common/types/game/lobby';

import DotSeparator from 'client/components/common/DotSeparator/DotSeparator';
import Flex from 'client/components/common/Flex/Flex';
import Text from 'client/components/common/Text/Text';
import { GameOptionsProps } from 'client/components/game/Lobby/Lobby';

import styles from './Game.module.scss';

interface GameProps<Game extends GameType> extends WithClassName {
  game: LobbyGame<Game>;
  onClick(game: LobbyGame<Game>): void;
  renderOptions?: ComponentType<GameOptionsProps<Game>>;
}

const STATUS_CAPTION: Record<GameStatus, string> = {
  [GameStatus.WAITING]: 'ожидание игроков',
  [GameStatus.GAME_IN_PROGRESS]: 'идет игра',
  [GameStatus.GAME_ENDED]: 'игра окончена',
};

const Game = <Game extends GameType>(props: GameProps<Game>) => {
  const { className, game, renderOptions: Options, onClick } = props;

  const handleClick = useCallback(() => {
    onClick(game);
  }, [game, onClick]);

  const options = useMemo(() => {
    if (!Options) {
      return null;
    }

    return <Options options={game.options} />;
  }, [Options, game.options]);

  return (
    <Flex className={classNames(styles.root, className)} alignItems="center" onClick={handleClick}>
      <Flex direction="column" between={2}>
        <Text size="l">
          {game.name}

          <DotSeparator />

          {STATUS_CAPTION[game.status]}
        </Text>

        {options}
      </Flex>

      <Text className={styles.playersCount} size="xxl">{`${game.players.length}/${game.options.maxPlayersCount}`}</Text>
    </Flex>
  );
};

export default typedReactMemo(Game);
