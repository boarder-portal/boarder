import { ComponentType, useCallback, useState } from 'react';
import { useHistory, useParams } from 'react-router-dom';

import { GAME_NAMES } from 'common/constants/game';

import typedReactMemo from 'client/types/typedReactMemo';
import { GameOptions, GameType } from 'common/types/game';
import { LobbyClientEventMap, LobbyEventType, LobbyServerEventMap, LobbyUpdateEvent } from 'common/types/game/lobby';

import useGameOptions from 'client/components/game/Lobby/hooks/useGameOptions';
import useBoolean from 'client/hooks/useBoolean';
import useImmutableCallback from 'client/hooks/useImmutableCallback';
import useSocket from 'client/hooks/useSocket';

import Button from 'client/components/common/Button/Button';
import Flex from 'client/components/common/Flex/Flex';
import Modal from 'client/components/common/Modal/Modal';
import Text from 'client/components/common/Text/Text';
import LobbyGame from 'client/components/game/Lobby/components/Game/Game';
import NewGameOptions from 'client/components/game/Lobby/components/NewGameOptions/NewGameOptions';
import BombersGameOptions from 'client/components/games/bombers/BombersGameOptions/BombersGameOptions';
import CarcassonneGameOptions from 'client/components/games/carcassonne/CarcassonneGameOptions/CarcassonneGameOptions';
import MahjongGameOptions from 'client/components/games/mahjong/MahjongGameOptions/MahjongGameOptions';
import PexesoGameOptions from 'client/components/games/pexeso/PexesoGameOptions/PexesoGameOptions';
import SevenWondersGameOptions from 'client/components/games/sevenWonders/SevenWondersGameOptions/SevenWondersGameOptions';

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

const GAME_OPTIONS_MAP: Partial<{
  [Game in GameType]: ComponentType<GameOptionsProps<Game>>;
}> = {
  [GameType.PEXESO]: PexesoGameOptions,
  [GameType.CARCASSONNE]: CarcassonneGameOptions,
  [GameType.SEVEN_WONDERS]: SevenWondersGameOptions,
  [GameType.BOMBERS]: BombersGameOptions,
  [GameType.MAHJONG]: MahjongGameOptions,
};

const Lobby = <Game extends GameType>() => {
  const { game } = useParams<{ game: Game }>();

  const [lobby, setLobby] = useState<LobbyUpdateEvent<Game> | null>(null);
  const {
    value: mobileCreateGameModalOpen,
    setTrue: openMobileCreateGameModal,
    setFalse: closeMobileCreateGameModal,
  } = useBoolean(false);

  const history = useHistory();
  const { options, setOptions, refreshDefaultOptions } = useGameOptions(game);

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
    closeMobileCreateGameModal();

    // @ts-ignore
    socket?.emit(LobbyEventType.CREATE_GAME, options);

    refreshDefaultOptions();
  }, [closeMobileCreateGameModal, options, refreshDefaultOptions, socket]);

  const GameOptions = GAME_OPTIONS_MAP[game] as ComponentType<GameOptionsProps<Game>>;

  return (
    <Flex className={styles.root} direction="column" between={5}>
      <Text size="xxl" weight="bold">
        {GAME_NAMES[game]}
      </Text>

      {lobby && (
        <>
          <Flex className={styles.content} between={10} alignItems="flexStart">
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
                <Flex alignItems="center" justifyContent="center">
                  <Text size="xl">Игр пока нет</Text>
                </Flex>
              )}
            </Flex>

            <Flex className={styles.desktopOptionsBlock} direction="column" between={3}>
              <Text size="xxl">Настройки</Text>

              <NewGameOptions game={game} options={options} setOptions={setOptions} createGame={createGame} />
            </Flex>
          </Flex>

          <Flex className={styles.mobileCreateGameBlock} direction="column" justifyContent="center">
            <Button onClick={openMobileCreateGameModal}>Создать игру</Button>
          </Flex>

          <Modal
            open={mobileCreateGameModalOpen}
            title="Настройки"
            mobileFullHeight
            onClose={closeMobileCreateGameModal}
          >
            <NewGameOptions
              className={styles.mobileOptionsBlock}
              game={game}
              options={options}
              setOptions={setOptions}
              createGame={createGame}
            />
          </Modal>
        </>
      )}
    </Flex>
  );
};

export default typedReactMemo(Lobby);
