import { FC, memo, useMemo } from 'react';

import { CardId } from 'common/types/machiKoro';

import isNotUndefined from 'common/utilities/isNotUndefined';
import getCard from 'common/utilities/machiKoro/getCard';

import CardLine from 'client/pages/Game/components/MachiKoroGame/components/CardLine/CardLine';

import styles from './Board.module.scss';

interface BoardProps {
  board: CardId[];
  withActions: boolean;
  availableCoins: number;
  builtMajors: CardId[];
  onSelect(cardId: CardId): void;
}

const Board: FC<BoardProps> = (props) => {
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
