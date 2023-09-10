import classNames from 'classnames';
import React from 'react';

import { MeepleType, PlayerColor } from 'common/types/games/carcassonne';

import Flex from 'client/components/common/Flex/Flex';

import styles from './Meeple.module.scss';

interface MeepleProps {
  className?: string;
  style?: React.CSSProperties;
  type: MeepleType;
  color: PlayerColor;
  onClick?(): void;
}

const Meeple: React.FC<MeepleProps> = (props) => {
  const { className, style, type, color, onClick } = props;

  return (
    <Flex className={className} style={style} alignItems="center" justifyContent="center" onClick={onClick}>
      <div className={classNames(styles.meeple, styles[type])} style={{ backgroundColor: color }} />
    </Flex>
  );
};

export default React.memo(Meeple);
