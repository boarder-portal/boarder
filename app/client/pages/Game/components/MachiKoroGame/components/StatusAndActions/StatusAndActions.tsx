import classNames from 'classnames';
import { FC, memo, useMemo } from 'react';

import { WithClassName } from 'client/types/react';
import { CardType, Player, PlayerWaitingActionType } from 'common/types/games/machiKoro';

import Dice, { DiceType } from 'client/components/Dice/Dice';
import Button from 'client/components/common/Button/Button';
import Flex from 'client/components/common/Flex/Flex';
import Text from 'client/components/common/Text/Text';

import styles from './StatusAndAction.module.scss';

interface StatusAndActionsProps extends WithClassName {
  activePlayer: Player;
  isPlayerActive: boolean;
  dices: number[];
  withHarborEffect: boolean;
  waitingAction: PlayerWaitingActionType | null;
  winner: string | null;
  onEndTurn(): void;
  onSelectDicesCount(count: number): void;
  onSelectNeedToReroll(needToReroll: boolean): void;
  onSelectNeedToUseHarbor(needToUse: boolean): void;
  onSelectPublisherTarget(publisherTarget: CardType.SHOP | CardType.RESTAURANT): void;
}

const StatusAndActions: FC<StatusAndActionsProps> = (props) => {
  const {
    className,
    activePlayer,
    isPlayerActive,
    dices,
    withHarborEffect,
    waitingAction,
    winner,
    onEndTurn,
    onSelectDicesCount,
    onSelectNeedToReroll,
    onSelectNeedToUseHarbor,
    onSelectPublisherTarget,
  } = props;

  const status = useMemo(() => {
    if (waitingAction === PlayerWaitingActionType.CHOOSE_DICES_COUNT) {
      return 'Выбирает количество кубиков';
    }

    if (waitingAction === PlayerWaitingActionType.CHOOSE_NEED_TO_REROLL) {
      return 'Выбирает перекинуть ли кубики';
    }

    if (waitingAction === PlayerWaitingActionType.CHOOSE_NEED_TO_USE_HARBOR) {
      return 'Выбирает добавить ли к кубикам 2';
    }

    if (waitingAction === PlayerWaitingActionType.CHOOSE_CARDS_TO_SWAP) {
      return 'Выбирает карты для обмена';
    }

    if (waitingAction === PlayerWaitingActionType.CHOOSE_PLAYER) {
      return 'Выбирает игрока';
    }

    if (waitingAction === PlayerWaitingActionType.CHOOSE_PUBLISHER_TARGET) {
      return 'Выбирает тип зданий для Издательства';
    }

    return 'Ходит';
  }, [waitingAction]);

  const commonInfo = useMemo(
    () => (
      <Flex between={2} alignItems="center">
        <Flex between={2} alignItems="center">
          <Text weight="bold">{activePlayer.name}</Text>
          <div>{status}</div>
        </Flex>

        {dices.length > 0 && (
          <Flex between={2} alignItems="center">
            {dices.map((dice, index) => (
              <Dice key={index} number={dice as DiceType} />
            ))}

            {withHarborEffect && <div>+2</div>}
          </Flex>
        )}
      </Flex>
    ),
    [activePlayer.name, dices, status, withHarborEffect],
  );

  const actions = useMemo(() => {
    if (!isPlayerActive) {
      return null;
    }

    if (waitingAction === PlayerWaitingActionType.CHOOSE_DICES_COUNT) {
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

    if (waitingAction === PlayerWaitingActionType.CHOOSE_NEED_TO_REROLL) {
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

    if (waitingAction === PlayerWaitingActionType.CHOOSE_NEED_TO_USE_HARBOR) {
      return (
        <Flex between={2} alignItems="center">
          <Text>Прибавить к кубикам 2?</Text>

          <Flex between={2} alignItems="center">
            <Button size="s" onClick={() => onSelectNeedToUseHarbor(true)}>
              Да
            </Button>

            <Button size="s" onClick={() => onSelectNeedToUseHarbor(false)}>
              Нет
            </Button>
          </Flex>
        </Flex>
      );
    }

    if (waitingAction === PlayerWaitingActionType.CHOOSE_PUBLISHER_TARGET) {
      return (
        <Flex between={2} alignItems="center">
          <Text>За что взять монеты?</Text>

          <Flex between={2} alignItems="center">
            <Button size="s" onClick={() => onSelectPublisherTarget(CardType.SHOP)}>
              Магазины
            </Button>

            <Button size="s" onClick={() => onSelectPublisherTarget(CardType.RESTAURANT)}>
              Рестораны
            </Button>
          </Flex>
        </Flex>
      );
    }

    if (!waitingAction) {
      return (
        <Button size="s" onClick={onEndTurn}>
          Завершить ход
        </Button>
      );
    }
  }, [
    isPlayerActive,
    onEndTurn,
    onSelectDicesCount,
    onSelectNeedToReroll,
    onSelectNeedToUseHarbor,
    onSelectPublisherTarget,
    waitingAction,
  ]);

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
