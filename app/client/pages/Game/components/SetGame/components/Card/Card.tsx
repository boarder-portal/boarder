import React, { useCallback } from 'react';
import times from 'lodash/times';
import classNames from 'classnames';

import { ICard } from 'common/types/set';

import CardObject from 'client/pages/Game/components/SetGame/components/Card/componetns/CardObject/CardObject';
import Box from 'client/components/common/Box/Box';

import styles from './Card.pcss';

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
    <Box
      className={classNames(styles.root, {
        [styles.selected]: isSelected,
      })}
      between={20}
      flex
      column
      alignItems="center"
      justifyContent="center"
      onClick={handleClick}
    >
      {times(card.count).map((objIndex) => (
        <CardObject key={objIndex} card={card} />
      ))}
    </Box>
  );
};

export default React.memo(Card);
