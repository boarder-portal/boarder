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

  &.Card {
    &:not(&_visible) {
      background: black;
    }
  }
`;

function Suit({ suit }: { suit: ESuit }) {
  if (suit === ESuit.HEARTS) {
    return (
      <span>❤️️</span>
    );
  }

  if (suit === ESuit.SPADES) {
    return (
      <span>♠️️</span>
    );
  }

  if (suit === ESuit.CLUBS) {
    return (
      <span>♣️</span>
    );
  }

  return (
    <span>♦️</span>
  );
}

const Card: React.FC<ICardProps> = (props) => {
  const { className, card, isVisible, onClick } = props;

  return (
    <Root
      className={b({ visible: isVisible }).mix(className)}
      flex
      justifyContent="center"
      alignItems="center"
      onClick={onClick}
    >
      {isVisible && (
        <div>
          {card.value}
          <Suit suit={card.suit} />
        </div>
      )}
    </Root>
  );
};

export default React.memo(Card);
