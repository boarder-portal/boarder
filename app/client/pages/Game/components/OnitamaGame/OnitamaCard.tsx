import React, { useCallback } from 'react';
import times from 'lodash/times';
import block from 'bem-cn';
import styled from 'styled-components';

import { ALL_CARDS } from 'common/constants/games/onitama';

import { ECardType } from 'common/types/onitama';

import Box from 'client/components/common/Box/Box';

interface IOnitamaCardProps {
  card: ECardType;
  isFlipped: boolean;
  isSelected: boolean;
  onClick?(card: ECardType): void;
}

const b = block('OnitamaCard');

const Root = styled(Box)`
  width: 100px;
  padding: 4px 10px;
  border-radius: 4px;
  border: 1px solid black;

  .OnitamaCard {
    &__cells {
      transform: scaleY(-1);

      &_isFlipped {
        transform: scaleX(-1);
      }
    }
  }
`;

const OnitamaCard: React.FC<IOnitamaCardProps> = (props) => {
  const {
    card,
    isFlipped,
    isSelected,
    onClick,
  } = props;
  const legalMoves = ALL_CARDS[card];

  const handleClick = useCallback(() => {
    if (onClick) {
      onClick(card);
    }
  }, [card, onClick]);

  return (
    <Root
      className={b()}
      column
      alignItems="center"
      between={4}
      background={isSelected ? '#7f7' : undefined}
      onClick={onClick && handleClick}
    >
      <Box className={b('cells', { isFlipped })} flex column between={1} alignItems="center">
        {times(5, (y) => (
          <Box key={y} flex between={1}>
            {times(5, (x) => (
              <Box
                key={x}
                width={10}
                height={10}
                background={
                  x === 2 && y === 2
                    ? '#000'
                    : legalMoves.some(([cellY, cellX]) => cellY === y - 2 && cellX === x - 2)
                      ? '#900'
                      : '#eee'
                }
              >

              </Box>
            ))}
          </Box>
        ))}
      </Box>

      <div style={{ textAlign: 'center' }}>
        {card}
      </div>
    </Root>
  );
};

export default React.memo(OnitamaCard);
