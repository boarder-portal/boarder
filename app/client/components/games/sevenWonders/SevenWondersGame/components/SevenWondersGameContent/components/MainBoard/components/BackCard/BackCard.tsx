import classNames from 'classnames';
import { CSSProperties, FC, memo } from 'react';

import { WithClassName } from 'client/types/react';

import Image from 'client/components/common/Image/Image';

import styles from './BackCard.module.scss';

interface BackCardProps extends WithClassName {
  style?: CSSProperties;
  type: number | 'leader';
  onClick?(): void;
}

const BackCard: FC<BackCardProps> = (props) => {
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

export default memo(BackCard);
