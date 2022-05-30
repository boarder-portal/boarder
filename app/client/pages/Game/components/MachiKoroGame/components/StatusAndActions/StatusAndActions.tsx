import { FC, memo, useMemo } from 'react';
import sum from 'lodash/sum';
import classNames from 'classnames';

import { EPlayerWaitingAction, IPlayer } from 'common/types/machiKoro';

import Flex from 'client/components/common/Flex/Flex';
import Text from 'client/components/common/Text/Text';
import Button from 'client/components/common/Button/Button';

import styles from './StatusAndAction.pcss';

interface IActionsProps {
  className?: string;
  player: IPlayer;
  activePlayer: IPlayer;
  isPlayerActive: boolean;
  dices: number[];
  winner: string | null;
  onEndTurn(): void;
  onSelectDicesCount(count: number): void;
  onSelectNeedToReroll(needToReroll: boolean): void;
}

const StatusAndActions: FC<IActionsProps> = (props) => {
  const {
    className,
    player,
    activePlayer,
    isPlayerActive,
    dices,
    winner,
    onEndTurn,
    onSelectDicesCount,
    onSelectNeedToReroll,
  } = props;

  const status = useMemo(() => {
    if (activePlayer.data.waitingAction === EPlayerWaitingAction.CHOOSE_DICES_COUNT) {
      return 'Выбирает количество кубиков';
    }

    if (activePlayer.data.waitingAction === EPlayerWaitingAction.CHOOSE_NEED_TO_REROLL) {
      return 'Выбирает перекинуть ли кубики';
    }

    if (activePlayer.data.waitingAction === EPlayerWaitingAction.CHOOSE_CARDS_TO_SWAP) {
      return 'Выбирает карты для обмена';
    }

    if (activePlayer.data.waitingAction === EPlayerWaitingAction.CHOOSE_PLAYER) {
      return 'Выбирает игрока';
    }

    return 'Ходит';
  }, [activePlayer]);

  const commonInfo = useMemo(
    () => (
      <Flex between={2} alignItems="center">
        <Flex between={2} alignItems="center">
          <Text weight="bold">{activePlayer.name}</Text>
          <div>{status}</div>
        </Flex>

        <div>
          {Boolean(dices.length) && (
            <div>{`Кубик${dices.length === 2 ? 'и' : ''}: ${dices.join(',')} ${
              dices.length === 2 ? `(${sum(dices)})` : ''
            }`}</div>
          )}
        </div>
      </Flex>
    ),
    [activePlayer.name, dices, status],
  );

  const actions = useMemo(() => {
    if (player.data.waitingAction === EPlayerWaitingAction.CHOOSE_DICES_COUNT) {
      return (
        <Flex between={2} alignItems="center">
          <Text>Сколько кубиков кинуть?</Text>

          <Flex between={2} alignItems="center">
            <Button size="s" onClick={() => onSelectDicesCount(1)}>
              Один
            </Button>
            <Button size="s" onClick={() => onSelectDicesCount(2)}>
              Два
            </Button>
          </Flex>
        </Flex>
      );
    }

    if (player.data.waitingAction === EPlayerWaitingAction.CHOOSE_NEED_TO_REROLL) {
      return (
        <Flex between={2} alignItems="center">
          <Text>Перекинуть кубики?</Text>

          <Flex between={2} alignItems="center">
            <Button size="s" onClick={() => onSelectNeedToReroll(true)}>
              Да
            </Button>
            <Button size="s" onClick={() => onSelectNeedToReroll(false)}>
              Нет
            </Button>
          </Flex>
        </Flex>
      );
    }

    if (!player.data.waitingAction && isPlayerActive) {
      return (
        <Button size="s" onClick={onEndTurn}>
          Завершить ход
        </Button>
      );
    }
  }, [isPlayerActive, onEndTurn, onSelectDicesCount, onSelectNeedToReroll, player.data.waitingAction]);

  if (winner) {
    return (
      <Flex between={2} className={classNames(styles.root, className)}>
        <Text weight="bold">{winner}</Text>
        <div>победил(а)!</div>
      </Flex>
    );
  }

  return (
    <Flex className={classNames(styles.root, className)} between={2} alignItems="center">
      {commonInfo}
      {actions}
    </Flex>
  );
};

export default memo(StatusAndActions);
