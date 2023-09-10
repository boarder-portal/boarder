import React from 'react';
import classNames from 'classnames';

import { ESuit, ICard } from 'common/types/cards';

import Flex from 'client/components/common/Flex/Flex';

import styles from './Card.module.scss';

interface ICardProps {
  className?: string;
  card: ICard;
  isVisible: boolean;
  onClick?(): void;
}

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

export default React.memo(Card);
