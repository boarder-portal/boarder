import React from 'react';
import block from 'bem-cn';
import styled from 'styled-components';

import { EGame, IPlayer } from 'common/types';
import typedReactMemo from 'client/types/typedReactMemo';
import { ICommonGameOptions, IRoom } from 'common/types/room';

import Button from 'client/components/common/Button/Button';
import Box from 'client/components/common/Box/Box';
import LobbyRoom from 'client/components/Lobby/components/LobbyRoom/LobbyRoom';
import Modal from 'client/components/common/Modal/Modal';

import { useBoolean } from 'client/hooks/useBoolean';

interface ILobbyProps<Options, Player extends IPlayer> {
  game: EGame;
  rooms: IRoom<Options, Player>[];
  options: React.ReactNode;
  renderRoomOptions(options: Options): React.ReactNode;
  onCreateRoom(): void;
  onEnterRoom(roomId: string): void;
}

const b = block('Lobby');

const Root = styled.div`
  .Lobby {
    &__room {
      cursor: pointer;
      flex: 1 1 33.33%;
      max-width: calc(50% - 16px);
    }

    &__createRoomButton,
    &__room {
      transition: transform 0.2s;
      will-change: transform;
      margin-left: 16px;
      margin-top: 16px;

      &:hover {
        transform: translateY(-4px);
      }
    }

    &__createRoomButton {
      flex: 0 0 110px;
      min-height: 110px;
      border-radius: 8px;
    }

  }
`;

const Lobby = <Options extends ICommonGameOptions, Player extends IPlayer>(props: ILobbyProps<Options, Player>) => {
  const {
    game,
    rooms,
    options,
    renderRoomOptions,
    onCreateRoom,
    onEnterRoom,
  } = props;

  const {
    value: isOptionsModalOpened,
    setTrue: openOptionsModal,
    setFalse: closeOptionsModal,
  } = useBoolean(false);

  return (
    <Root className={b()}>
      <Box size="xxl" bold>{game}</Box>

      <Box between={8} mt={4} ml={-16} flex withWrap>
        <Button
          className={b('createRoomButton').toString()}
          onClick={openOptionsModal}
        >
          Создать комнату
        </Button>

        {rooms.map((room) => (
          <LobbyRoom
            className={b('room').toString()}
            key={room.id}
            title={room.id}
            options={renderRoomOptions(room.options)}
            players={room.players.length}
            maxPlayers={room.options.playersCount}
            onClick={() => onEnterRoom(room.id)}
          />
        ))}
      </Box>

      {isOptionsModalOpened && (
        <Modal onClose={closeOptionsModal}>
          <Box flex column between={16}>
            <Box size="xxl">Настройки комнаты</Box>

            {options}

            <Button
              onClick={() => {
                onCreateRoom();
                closeOptionsModal();
              }}
            >
              Создать комнату
            </Button>
          </Box>
        </Modal>
      )}
    </Root>
  );
};

export default typedReactMemo(Lobby);
