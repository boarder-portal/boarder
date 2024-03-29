import classNames from 'classnames';
import { FC, memo } from 'react';

import { WithClassName } from 'client/types/react';
import { Card as CardModel, Suit } from 'common/types/game/cards';

import Flex from 'client/components/common/Flex/Flex';

import styles from './Card.module.scss';

interface CardProps extends WithClassName {
  card: CardModel;
  isVisible: boolean;
  onClick?(): void;
}

const SUITS_MAP: Record<Suit, string> = {
  [Suit.HEARTS]: '\u2665',
  [Suit.SPADES]: '\u2660',
  [Suit.CLUBS]: '\u2663',
  [Suit.DIAMONDS]: '\u2666',
};
const RED_COLORS = [Suit.HEARTS, Suit.DIAMONDS];

const Card: FC<CardProps> = (props) => {
  const { className, card, isVisible, onClick } = props;

  return (
    <Flex
      className={classNames(
        styles.root,
        isVisible ? styles.visible : undefined,
        RED_COLORS.includes(card.suit) ? styles.red : styles.black,
        className,
      )}
      justifyContent="center"
      alignItems="center"
      onClick={onClick}
    >
      {isVisible && (
        <div>
          {card.value}

          <span className={styles.suit}>{SUITS_MAP[card.suit]}</span>
        </div>
      )}
    </Flex>
  );
};

export default memo(Card);
