import { FC, memo } from 'react';

import { EPlayerWaitingAction, IPlayer } from 'common/types/machiKoro';

import Flex from 'client/components/common/Flex/Flex';
import Text from 'client/components/common/Text/Text';
import Button from 'client/components/common/Button/Button';

interface IActionsProps {
  player: IPlayer;
  isPlayerActive: boolean;
  onEndTurn(): void;
  onSelectDicesCount(count: number): void;
  onSelectNeedToReroll(needToReroll: boolean): void;
}

const Actions: FC<IActionsProps> = (props) => {
  const { player, isPlayerActive, onEndTurn, onSelectDicesCount, onSelectNeedToReroll } = props;

  if (player.data.waitingAction === EPlayerWaitingAction.CHOOSE_DICES_COUNT) {
    return (
      <Flex direction="column" between={2}>
        <Text>Сколько кубиков кинуть?</Text>

        <Flex between={2}>
          <Button onClick={() => onSelectDicesCount(1)}>Один</Button>
          <Button onClick={() => onSelectDicesCount(2)}>Два</Button>
        </Flex>
      </Flex>
    );
  }

  if (player.data.waitingAction === EPlayerWaitingAction.CHOOSE_NEED_TO_REROLL) {
    return (
      <Flex direction="column" between={2}>
        <Text>Перекинуть кубики?</Text>

        <Flex between={2}>
          <Button onClick={() => onSelectNeedToReroll(true)}>Да</Button>
          <Button onClick={() => onSelectNeedToReroll(false)}>Нет</Button>
        </Flex>
      </Flex>
    );
  }

  if (!player.data.waitingAction && isPlayerActive) {
    return <Button onClick={onEndTurn}>Завершить ход</Button>;
  }

  return null;
};

export default memo(Actions);
