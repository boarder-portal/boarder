import classNames from 'classnames';
import { FC, memo } from 'react';

import { Card } from 'common/types/games/set';

import styles from './CardObject.module.scss';

interface CardObjectProps {
  card: Card;
}

const CardObject: FC<CardObjectProps> = (props) => {
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

export default memo(CardObject);
