import React from 'react';
import classNames from 'classnames';

import { EMeepleType, EPlayerColor } from 'common/types/carcassonne';

import Flex from 'client/components/common/Flex/Flex';

import styles from './Meeple.module.scss';

interface IMeepleProps {
  className?: string;
  style?: React.CSSProperties;
  type: EMeepleType;
  color: EPlayerColor;
  onClick?(): void;
}

const Meeple: React.FC<IMeepleProps> = (props) => {
  const { className, style, type, color, onClick } = props;

  return (
    <Flex className={className} style={style} alignItems="center" justifyContent="center" onClick={onClick}>
      <div className={classNames(styles.meeple, styles[type])} style={{ backgroundColor: color }} />
    </Flex>
  );
};

export default React.memo(Meeple);
