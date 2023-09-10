import classNames from 'classnames';
import React from 'react';

import { Card } from 'common/types/games/set';

import styles from './CardObject.module.scss';

interface CardObjectProps {
  card: Card;
}

const CardObject: React.FC<CardObjectProps> = (props) => {
  const { card } = props;

  return (
    <div
      className={classNames(
        styles.root,
        styles[`color_${card.color}`],
        styles[`shape_${card.shape}`],
        styles[`fill_${card.fill}`],
      )}
    />
  );
};

export default React.memo(CardObject);
