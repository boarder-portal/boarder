import React from 'react';
import styled from 'styled-components';
import block from 'bem-cn';

import { ESuit, ICard } from 'common/types/cards';

import Box from 'client/components/common/Box/Box';

interface ICardProps {
  className?: string;
  card: ICard;
  isVisible: boolean;
  onClick?(): void;
}

const b = block('Card');

const Root = styled(Box)`
  width: 50px;
  height: 70px;
  border: 1px solid black;
  border-radius: 8px;
  user-select: none;
  font-size: 24px;

  &.Card {
    &:not(&_visible) {
      background: black;
    }

    &_color {
      &_black {
        color: black;
      }

      &_red {
        color: red;
      }
    }
  }

  .Card {
    &__suit {
      font-size: 28px;
    }
  }
`;

const SUITS_MAP: Record<ESuit, string> = {
  [ESuit.HEARTS]: '\u2665',
  [ESuit.SPADES]: '\u2660',
  [ESuit.CLUBS]: '\u2663',
  [ESuit.DIAMONDS]: '\u2666',
};
const RED_COLORS = [ESuit.HEARTS, ESuit.DIAMONDS];

const Card: React.FC<ICardProps> = (props) => {
  const { className, card, isVisible, onClick } = props;

  return (
    <Root
      className={b({
        visible: isVisible,
        color: RED_COLORS.includes(card.suit)
          ? 'red'
          : 'black',
      }).mix(className)}
      flex
      justifyContent="center"
      alignItems="center"
      onClick={onClick}
    >
      {isVisible && (
        <div>
          {card.value}

          <span className={b('suit')}>
            {SUITS_MAP[card.suit]}
          </span>
        </div>
      )}
    </Root>
  );
};

export default React.memo(Card);
