import React from 'react';
import block from 'bem-cn';
import styled from 'styled-components';

import { EGame } from 'common/types';
import typedReactMemo from 'client/types/typedReactMemo';
import { TGameOptions } from 'common/types/game';
import { ILobbyUpdateEvent } from 'common/types/lobby';

import Button from 'client/components/common/Button/Button';
import Box from 'client/components/common/Box/Box';
import LobbyRoom from 'client/components/Lobby/components/LobbyRoom/LobbyRoom';

interface ILobbyProps<Game extends EGame> {
  game: EGame;
  rooms: ILobbyUpdateEvent<Game>['rooms'];
  options?: React.ReactNode;
  renderRoomOptions?(options: TGameOptions<Game>): React.ReactNode;
  onCreateRoom(): void;
  onEnterRoom(roomId: string): void;
}

const b = block('Lobby');

const Root = styled.div`
  .Lobby {

  }
`;

const Lobby = <Game extends EGame>(props: ILobbyProps<Game>) => {
  const {
    game,
    rooms,
    options,
    renderRoomOptions,
    onCreateRoom,
    onEnterRoom,
  } = props;

  return (
    <Root className={b()}>
      <Box size="xxl" bold>{game}</Box>

      <Box flex mt={20}>
        <Box flex column grow between={12}>
          {rooms.length ? (
            rooms.map((room) => (
              <LobbyRoom
                className={b('room').toString()}
                key={room.id}
                title={room.id}
                options={renderRoomOptions?.(room.options)}
                players={room.players.length}
                maxPlayers={room.options.playersCount}
                gameIsStarted={room.gameIsStarted}
                onClick={() => onEnterRoom(room.id)}
              />
            ))

          ) : (
            <Box
              flex
              alignItems="center"
              justifyContent="center"
              grow
              size="xl"
            >
              Комнат пока нет
            </Box>
          )}
        </Box>

        <Box ml={40}>
          <Box flex column between={16}>
            <Box size="xxl">Настройки комнаты</Box>

            {options}

            <Button
              onClick={() => {
                onCreateRoom();
              }}
            >
              Создать комнату
            </Button>
          </Box>
        </Box>
      </Box>
    </Root>
  );
};

export default typedReactMemo(Lobby);
