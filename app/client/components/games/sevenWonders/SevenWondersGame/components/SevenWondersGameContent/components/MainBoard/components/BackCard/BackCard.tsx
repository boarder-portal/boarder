import classNames from 'classnames';
import { CSSProperties, FC, memo } from 'react';

import { WithClassName } from 'client/types/react';
import { GameType } from 'common/types/game';

import GameImage from 'client/components/common/GameImage/GameImage';

import styles from './BackCard.module.scss';

interface BackCardProps extends WithClassName {
  style?: CSSProperties;
  type: number | 'leader';
  onClick?(): void;
}

const BackCard: FC<BackCardProps> = (props) => {
  const { className, style, type, onClick } = props;

  return (
    <GameImage
      className={classNames(styles.root, className)}
      game={GameType.SEVEN_WONDERS}
      src={`/cards/backs/${type}.png`}
      style={style}
      onClick={onClick}
    />
  );
};

export default memo(BackCard);
