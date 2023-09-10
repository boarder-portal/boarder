import { memo, FC, useMemo } from 'react';

import { ECardId } from 'common/types/machiKoro';

import getCard from 'common/utilities/machiKoro/getCard';
import isNotUndefined from 'common/utilities/isNotUndefined';

import CardLine from 'client/pages/Game/components/MachiKoroGame/components/CardLine/CardLine';

import styles from './Board.module.scss';

interface IBoardProps {
  board: ECardId[];
  withActions: boolean;
  availableCoins: number;
  builtMajors: ECardId[];
  onSelect(cardId: ECardId): void;
}

const Board: FC<IBoardProps> = (props) => {
  const { board, withActions, availableCoins, builtMajors, onSelect } = props;

  const disabledIds = useMemo(() => {
    if (!withActions) {
      return [];
    }

    return board
      .map((cardId) => {
        const card = getCard(cardId);
        const hasAlreadyBuiltUniqCard = builtMajors.includes(cardId);

        return hasAlreadyBuiltUniqCard || availableCoins < card.cost ? cardId : undefined;
      })
      .filter(isNotUndefined);
  }, [availableCoins, board, builtMajors, withActions]);

  return <CardLine className={styles.root} cardsIds={board} disabledIds={disabledIds} onClick={onSelect} />;
};

export default memo(Board);
