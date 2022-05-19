import React from 'react';
import classNames from 'classnames';

import { ICard } from 'common/types/set';

import styles from './CardObject.pcss';

interface ICardObjectProps {
  card: ICard;
}

const CardObject: React.FC<ICardObjectProps> = (props) => {
  const { card } = props;

  return <div className={classNames(styles.root, styles[card.color], styles[card.shape], styles[card.fill])} />;
};

export default React.memo(CardObject);
