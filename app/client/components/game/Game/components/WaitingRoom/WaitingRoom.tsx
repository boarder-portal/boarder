import typedReactMemo from 'client/types/typedReactMemo';
import { BaseGamePlayer, PlayerStatus } from 'common/types';
import { GameType } from 'common/types/game';

import useAtom from 'client/hooks/useAtom';

import Button from 'client/components/common/Button/Button';
import Flex from 'client/components/common/Flex/Flex';
import Text from 'client/components/common/Text/Text';

import styles from './WaitingRoom.module.scss';

interface WaitingRoomProps<Game extends GameType> {
  gameName: string;
  players: BaseGamePlayer<Game>[];
  toggleReady(): void;
}

const WaitingRoom = <Game extends GameType>(props: WaitingRoomProps<Game>) => {
  const { gameName, players, toggleReady } = props;

  const [user] = useAtom('user');

  return (
    <div>
      <Text size="xxl" weight="bold">
        {gameName}
      </Text>

      <Flex className={styles.players} direction="column" between={3}>
        {players.map(({ login, status }) => (
          <Flex key={login} className={styles.user} alignItems="center">
            <div>{login}</div>
            <div className={styles.status}>{status === PlayerStatus.NOT_READY ? 'Не готов' : 'Готов'}</div>

            {login === user?.login && (
              <Button
                className={styles.changeReadyStatusButton}
                variant={status === PlayerStatus.NOT_READY ? 'contained' : 'outlined'}
                onClick={toggleReady}
              >
                {status === PlayerStatus.NOT_READY ? 'Готов' : 'Не готов'}
              </Button>
            )}
          </Flex>
        ))}
      </Flex>
    </div>
  );
};

export default typedReactMemo(WaitingRoom);
