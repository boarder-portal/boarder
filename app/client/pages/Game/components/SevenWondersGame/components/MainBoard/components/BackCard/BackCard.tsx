import classNames from 'classnames';
import React from 'react';

import Image from 'client/components/common/Image/Image';

import styles from './BackCard.module.scss';

interface BackCardProps {
  className?: string;
  style?: React.CSSProperties;
  type: number | 'leader';
  onClick?(): void;
}

const BackCard: React.FC<BackCardProps> = (props) => {
  const { className, style, type, onClick } = props;

  return (
    <Image
      className={classNames(styles.root, className)}
      src={`/sevenWonders/cards/backs/${type}.png`}
      style={style}
      onClick={onClick}
    />
  );
};

export default React.memo(BackCard);
