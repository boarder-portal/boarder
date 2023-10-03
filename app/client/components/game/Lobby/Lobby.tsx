import { ComponentType, useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import urls from 'client/constants/urls';
import { GAME_NAMES } from 'common/constants/game';

import typedReactMemo from 'client/types/typedReactMemo';
import { GameOptions, GameType } from 'common/types/game';
import {
  LobbyClientEventMap,
  LobbyEventType,
  LobbyGame,
  LobbyServerEventMap,
  LobbyUpdateEvent,
} from 'common/types/game/lobby';

import useGameOptions from 'client/components/game/Lobby/hooks/useGameOptions';
import useBoolean from 'client/hooks/useBoolean';
import useImmutableCallback from 'client/hooks/useImmutableCallback';
import useSocket from 'client/hooks/useSocket';

import Button from 'client/components/common/Button/Button';
import Flex from 'client/components/common/Flex/Flex';
import Modal from 'client/components/common/Modal/Modal';
import Text from 'client/components/common/Text/Text';
import Game from 'client/components/game/Lobby/components/Game/Game';
import NewGameOptions from 'client/components/game/Lobby/components/NewGameOptions/NewGameOptions';

import styles from './Lobby.module.scss';

export interface LobbyProps<Game extends GameType> {
  game: Game;
  renderGameOptions?: ComponentType<GameOptionsProps<Game>>;
  renderCreateGameOptions?: ComponentType<CreateGameOptionsProps<Game>>;
}

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

const Lobby = <Game extends GameType>(props: LobbyProps<Game>) => {
  const { game, renderGameOptions, renderCreateGameOptions } = props;

  const [lobby, setLobby] = useState<LobbyUpdateEvent<Game> | null>(null);
  const {
    value: mobileCreateGameModalOpen,
    setTrue: openMobileCreateGameModal,
    setFalse: closeMobileCreateGameModal,
  } = useBoolean(false);

  const navigate = useNavigate();
  const { options, setOptions, refreshDefaultOptions } = useGameOptions(game);

  const navigateToGame = useImmutableCallback((gameId: string) => {
    navigate(urls.getGameUrl(game, gameId));
  });

  const handleGameClick = useCallback(
    (game: LobbyGame<Game>) => {
      navigateToGame(game.id);
    },
    [navigateToGame],
  );

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
                  <Game key={game.id} game={game} onClick={handleGameClick} renderOptions={renderGameOptions} />
                ))
              ) : (
                <Flex alignItems="center" justifyContent="center">
                  <Text size="xl">Игр пока нет</Text>
                </Flex>
              )}
            </Flex>

            <Flex className={styles.desktopOptionsBlock} direction="column" between={3}>
              <Text size="xxl">Настройки</Text>

              <NewGameOptions
                game={game}
                options={options}
                setOptions={setOptions}
                createGame={createGame}
                renderCreateGameOptions={renderCreateGameOptions}
              />
            </Flex>
          </Flex>

          <Flex className={styles.mobileCreateGameBlock} direction="column" justifyContent="center">
            <Button onClick={openMobileCreateGameModal}>Создать игру</Button>
          </Flex>

          <Modal open={mobileCreateGameModalOpen} title="Настройки" fillViewport onClose={closeMobileCreateGameModal}>
            <NewGameOptions
              className={styles.mobileOptionsBlock}
              game={game}
              options={options}
              setOptions={setOptions}
              createGame={createGame}
              renderCreateGameOptions={renderCreateGameOptions}
            />
          </Modal>
        </>
      )}
    </Flex>
  );
};

export default typedReactMemo(Lobby);
