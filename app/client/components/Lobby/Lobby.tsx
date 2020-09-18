import React from 'react';
import block from 'bem-cn';
import styled from 'styled-components';

import { EGame, IPlayer } from 'common/types';
import typedReactMemo from 'client/types/typedReactMemo';
import { IRoom } from 'common/types/room';

import Button from 'client/components/common/Button/Button';
import Box from 'client/components/common/Box/Box';

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
    }
  }
`;

const Lobby = <Options, Player extends IPlayer>(props: ILobbyProps<Options, Player>) => {
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

      <Box flex alignItems="flex-end" between={8} mt={20}>
        <Button onClick={onCreateRoom}>Создать комнату</Button>

        {options}
      </Box>

      <Box between={8} mt={20}>
        {rooms.map((room) => (
          <Box
            key={room.id}
            className={b('room')}
            flex
            between={20}
            onClick={() => onEnterRoom(room.id)}
          >
            <Box>{room.id}</Box>

            {renderRoomOptions(room.options)}

            <Box>{room.players.map(({ login }) => login).join(', ')}</Box>
          </Box>
        ))}
      </Box>
    </Root>
  );
};

export default typedReactMemo(Lobby);
