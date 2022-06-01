import { FC, memo, useMemo } from 'react';
import classNames from 'classnames';

import { ECardType, EPlayerWaitingAction, IPlayer } from 'common/types/machiKoro';

import Flex from 'client/components/common/Flex/Flex';
import Text from 'client/components/common/Text/Text';
import Button from 'client/components/common/Button/Button';
import Dice, { TDice } from 'client/components/Dice/Dice';

import styles from './StatusAndAction.pcss';

interface IActionsProps {
  className?: string;
  player: IPlayer;
  activePlayer: IPlayer;
  isPlayerActive: boolean;
  dices: number[];
  withHarborEffect: boolean;
  winner: string | null;
  onEndTurn(): void;
  onSelectDicesCount(count: number): void;
  onSelectNeedToReroll(needToReroll: boolean): void;
  onSelectNeedToUseHarbor(needToUse: boolean): void;
  onSelectPublisherTarget(publisherTarget: ECardType.SHOP | ECardType.RESTAURANT): void;
}

const StatusAndActions: FC<IActionsProps> = (props) => {
  const {
    className,
    player,
    activePlayer,
    isPlayerActive,
    dices,
    withHarborEffect,
    winner,
    onEndTurn,
    onSelectDicesCount,
    onSelectNeedToReroll,
    onSelectNeedToUseHarbor,
    onSelectPublisherTarget,
  } = props;

  const status = useMemo(() => {
    if (activePlayer.data.waitingAction === EPlayerWaitingAction.CHOOSE_DICES_COUNT) {
      return 'Выбирает количество кубиков';
    }

    if (activePlayer.data.waitingAction === EPlayerWaitingAction.CHOOSE_NEED_TO_REROLL) {
      return 'Выбирает перекинуть ли кубики';
    }

    if (activePlayer.data.waitingAction === EPlayerWaitingAction.CHOOSE_NEED_TO_USE_HARBOR) {
      return 'Выбирает добавить ли к кубикам 2';
    }

    if (activePlayer.data.waitingAction === EPlayerWaitingAction.CHOOSE_CARDS_TO_SWAP) {
      return 'Выбирает карты для обмена';
    }

    if (activePlayer.data.waitingAction === EPlayerWaitingAction.CHOOSE_PLAYER) {
      return 'Выбирает игрока';
    }

    if (activePlayer.data.waitingAction === EPlayerWaitingAction.CHOOSE_PUBLISHER_TARGET) {
      return 'Выбирает тип зданий для Издательства';
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

        {dices.length > 0 && (
          <Flex between={2} alignItems="center">
            {dices.map((dice, index) => (
              <Dice key={index} number={dice as TDice} />
            ))}

            {withHarborEffect && <div>+2</div>}
          </Flex>
        )}
      </Flex>
    ),
    [activePlayer.name, dices, status, withHarborEffect],
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

    if (player.data.waitingAction === EPlayerWaitingAction.CHOOSE_NEED_TO_USE_HARBOR) {
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

    if (player.data.waitingAction === EPlayerWaitingAction.CHOOSE_PUBLISHER_TARGET) {
      return (
        <Flex between={2} alignItems="center">
          <Text>За что взять монеты?</Text>

          <Flex between={2} alignItems="center">
            <Button size="s" onClick={() => onSelectPublisherTarget(ECardType.SHOP)}>
              Магазины
            </Button>

            <Button size="s" onClick={() => onSelectPublisherTarget(ECardType.RESTAURANT)}>
              Рестораны
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
  }, [
    isPlayerActive,
    onEndTurn,
    onSelectDicesCount,
    onSelectNeedToReroll,
    onSelectNeedToUseHarbor,
    onSelectPublisherTarget,
    player.data.waitingAction,
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
