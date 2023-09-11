import classNames from 'classnames';
import times from 'lodash/times';
import { FC, memo, useCallback } from 'react';

import { Card as CardModel } from 'common/types/games/set';

import Flex from 'client/components/common/Flex/Flex';
import CardObject from 'client/pages/Game/components/SetGame/components/Card/componetns/CardObject/CardObject';

import styles from './Card.module.scss';

interface CardProps {
  card: CardModel;
  isSelected: boolean;
  onClick(card: CardModel): void;
}

const Card: FC<CardProps> = (props) => {
  const { card, isSelected, onClick } = props;

  const handleClick = useCallback(() => {
    onClick(card);
  }, [card, onClick]);

  return (
    <Flex
      className={classNames(styles.root, {
        [styles.selected]: isSelected,
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
