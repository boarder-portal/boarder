import React from 'react';
import classNames from 'classnames';

import { ICard } from 'common/types/set';

import styles from './CardObject.module.scss';

interface ICardObjectProps {
  card: ICard;
}

const CardObject: React.FC<ICardObjectProps> = (props) => {
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
