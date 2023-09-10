import React, { useCallback } from 'react';
import times from 'lodash/times';
import classNames from 'classnames';

import { ICard } from 'common/types/set';

import CardObject from 'client/pages/Game/components/SetGame/components/Card/componetns/CardObject/CardObject';
import Flex from 'client/components/common/Flex/Flex';

import styles from './Card.module.scss';

interface ICardProps {
  card: ICard;
  isSelected: boolean;
  onClick(card: ICard): void;
}

const Card: React.FC<ICardProps> = (props) => {
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

export default React.memo(Card);
