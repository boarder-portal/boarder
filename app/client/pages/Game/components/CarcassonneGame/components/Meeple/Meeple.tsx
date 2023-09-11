import classNames from 'classnames';
import { CSSProperties, FC, memo } from 'react';

import { WithClassName } from 'client/types/react';
import { MeepleType, PlayerColor } from 'common/types/games/carcassonne';

import Flex from 'client/components/common/Flex/Flex';

import styles from './Meeple.module.scss';

interface MeepleProps extends WithClassName {
  style?: CSSProperties;
  type: MeepleType;
  color: PlayerColor;
  onClick?(): void;
}

const Meeple: FC<MeepleProps> = (props) => {
  const { className, style, type, color, onClick } = props;

  return (
    <Flex className={className} style={style} alignItems="center" justifyContent="center" onClick={onClick}>
      <div className={classNames(styles.meeple, styles[type])} style={{ backgroundColor: color }} />
    </Flex>
  );
};

export default memo(Meeple);
