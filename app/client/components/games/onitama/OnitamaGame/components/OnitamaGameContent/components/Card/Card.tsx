import classNames from 'classnames';
import times from 'lodash/times';
import { FC, memo, useCallback } from 'react';

import { ALL_CARDS } from 'common/constants/games/onitama';

import { CardType } from 'common/types/games/onitama';

import Flex from 'client/components/common/Flex/Flex';

import styles from './Card.module.scss';

interface CardProps {
  card: CardType;
  isFlipped: boolean;
  isSelected: boolean;
  isDisabled: boolean;
  onClick?(card: CardType): void;
}

const Card: FC<CardProps> = (props) => {
  const { card, isFlipped, isSelected, isDisabled, onClick } = props;
  const legalMoves = ALL_CARDS[card];

  const handleClick = useCallback(() => {
    if (onClick) {
      onClick(card);
    }
  }, [card, onClick]);

  return (
    <Flex
      className={classNames(styles.root, { [styles.selected]: isSelected, [styles.disabled]: isDisabled })}
      direction="column"
      alignItems="center"
      between={1}
      onClick={handleClick}
    >
      <Flex
        className={classNames(styles.cells, {
          [styles.isFlipped]: isFlipped,
        })}
        direction="column"
        alignItems="center"
        between={1}
      >
        {times(5, (y) => (
          <Flex key={y} between={1}>
            {times(5, (x) => (
              <div
                key={x}
                style={{
                  width: '10px',
                  height: '10px',
                  background:
                    x === 2 && y === 2
                      ? '#000'
                      : legalMoves.some(([cellY, cellX]) => cellY === y - 2 && cellX === x - 2)
                      ? '#900'
                      : '#eee',
                }}
              />
            ))}
          </Flex>
        ))}
      </Flex>

      <div style={{ textAlign: 'center' }}>{card}</div>
    </Flex>
  );
};

export default memo(Card);
