import React from 'react';
import classNames from 'classnames';

import styles from './BackCard.pcss';

interface IBackCardProps {
  className?: string;
  style?: React.CSSProperties;
  type: number | 'leader';
  onClick?(): void;
}

const BackCard: React.FC<IBackCardProps> = (props) => {
  const { className, style, type, onClick } = props;

  return (
    <img
      className={classNames(styles.root, className)}
      src={`/sevenWonders/cards/backs/${type}.png`}
      style={style}
      onClick={onClick}
    />
  );
};

export default React.memo(BackCard);
