import classNames from 'classnames';
import times from 'lodash/times';
import { FC, memo, useCallback } from 'react';

import { Card as CardModel } from 'common/types/games/set';

import Flex from 'client/components/common/Flex/Flex';
import CardObject from 'client/components/games/set/SetGame/components/SetGameContent/components/Card/componetns/CardObject/CardObject';

import styles from './Card.module.scss';

interface CardProps {
  card: CardModel;
  cardIndex: number;
  isSelected: boolean;
  isHinted: boolean;
  onClick(cardIndex: number): void;
}

const Card: FC<CardProps> = (props) => {
  const { card, cardIndex, isSelected, isHinted, onClick } = props;

  const handleClick = useCallback(() => {
    onClick(cardIndex);
  }, [cardIndex, onClick]);

  return (
    <Flex
      className={classNames(styles.root, {
        [styles.selected]: isSelected,
        [styles.hinted]: isHinted,
      })}
      direction="column"
      alignItems="center"
      justifyContent="center"
      between={5}
      onClick={handleClick}
    >
      {times(card.count).map((objIndex) => (
        <CardObject key={objIndex} card={card} />
      ))}
    </Flex>
  );
};

export default memo(Card);
