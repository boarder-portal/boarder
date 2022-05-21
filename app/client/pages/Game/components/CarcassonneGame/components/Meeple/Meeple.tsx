import React from 'react';
import classNames from 'classnames';

import { EMeepleType, EPlayerColor } from 'common/types/carcassonne';

import Box from 'client/components/common/Box/Box';

import styles from './Meeple.pcss';

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
    <Box className={className} style={style} flex alignItems="center" justifyContent="center" onClick={onClick}>
      <div className={classNames(styles.meeple, styles[type])} style={{ backgroundColor: color }} />
    </Box>
  );
};

export default React.memo(Meeple);
