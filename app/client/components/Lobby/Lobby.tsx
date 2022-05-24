import React from 'react';

import typedReactMemo from 'client/types/typedReactMemo';
import { EGame, TGameOptions } from 'common/types/game';
import { ILobbyUpdateEvent } from 'common/types/lobby';

import LobbyGame from 'client/components/Lobby/components/Game/Game';
import Text from 'client/components/common/Text/Text';
import Flex from 'client/components/common/Flex/Flex';
import Button from 'client/components/common/Button/Button';

import styles from './Lobby.pcss';

interface ILobbyProps<Game extends EGame> {
  game: EGame;
  games: ILobbyUpdateEvent<Game>['games'];
  options?: React.ReactNode;
  renderGameOptions?(options: TGameOptions<Game>): React.ReactNode;
  onCreateGame(): void;
  onEnterGame(gameId: string): void;
}

const Lobby = <Game extends EGame>(props: ILobbyProps<Game>) => {
  const { game, games, options, renderGameOptions, onCreateGame, onEnterGame } = props;

  return (
    <div>
      <Text size="xxl" weight="bold">
        {game}
      </Text>

      <Flex className={styles.gamesAndOptions}>
        <Flex className={styles.games} direction="column" between={3}>
          {games.length ? (
            games.map((game) => (
              <LobbyGame
                key={game.id}
                title={game.name}
                options={renderGameOptions?.(game.options)}
                players={game.players.length}
                maxPlayers={game.options.playersCount}
                hasStarted={game.hasStarted}
                onClick={() => onEnterGame(game.id)}
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

          {options}

          <Button onClick={onCreateGame}>Создать игру</Button>
        </Flex>
      </Flex>
    </div>
  );
};

export default typedReactMemo(Lobby);
