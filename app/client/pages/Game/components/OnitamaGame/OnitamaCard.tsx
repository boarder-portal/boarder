import React, { useCallback } from 'react';
import times from 'lodash/times';
import classNames from 'classnames';

import { ALL_CARDS } from 'common/constants/games/onitama';

import { ECardType } from 'common/types/onitama';

import Flex from 'client/components/common/Flex/Flex';

import styles from './OnitamaCard.pcss';

interface IOnitamaCardProps {
  card: ECardType;
  isFlipped: boolean;
  isSelected: boolean;
  onClick?(card: ECardType): void;
}

const OnitamaCard: React.FC<IOnitamaCardProps> = (props) => {
  const { card, isFlipped, isSelected, onClick } = props;
  const legalMoves = ALL_CARDS[card];

  const handleClick = useCallback(() => {
    if (onClick) {
      onClick(card);
    }
  }, [card, onClick]);

  return (
    <Flex
      className={classNames(styles.root, { [styles.selected]: isSelected })}
      direction="column"
      alignItems="center"
      between={1}
      onClick={onClick && handleClick}
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

export default React.memo(OnitamaCard);
