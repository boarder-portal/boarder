import React from 'react';

import typedReactMemo from 'client/types/typedReactMemo';
import { EGame, TGameOptions } from 'common/types/game';
import { ILobbyUpdateEvent } from 'common/types/lobby';

import Button from 'client/components/common/Button/Button';
import LobbyRoom from 'client/components/Lobby/components/Room/Room';
import Text from 'client/components/common/Text/Text';
import Flex from 'client/components/common/Flex/Flex';

import styles from './Lobby.pcss';

interface ILobbyProps<Game extends EGame> {
  game: EGame;
  rooms: ILobbyUpdateEvent<Game>['rooms'];
  options?: React.ReactNode;
  renderRoomOptions?(options: TGameOptions<Game>): React.ReactNode;
  onCreateRoom(): void;
  onEnterRoom(roomId: string): void;
}

const Lobby = <Game extends EGame>(props: ILobbyProps<Game>) => {
  const { game, rooms, options, renderRoomOptions, onCreateRoom, onEnterRoom } = props;

  return (
    <div>
      <Text size="xxl" weight="bold">
        {game}
      </Text>

      <Flex className={styles.roomsAndOptions}>
        <Flex className={styles.rooms} direction="column" between={3}>
          {rooms.length ? (
            rooms.map((room) => (
              <LobbyRoom
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
            <Flex className={styles.rooms} alignItems="center" justifyContent="center">
              <Text size="xl">Комнат пока нет</Text>
            </Flex>
          )}
        </Flex>

        <Flex className={styles.options} direction="column" between={4}>
          <Text size="xxl">Настройки комнаты</Text>

          {options}

          <Button
            onClick={() => {
              onCreateRoom();
            }}
          >
            Создать комнату
          </Button>
        </Flex>
      </Flex>
    </div>
  );
};

export default typedReactMemo(Lobby);
