import classNames from 'classnames';
import { CSSProperties, FC, memo } from 'react';

import { WithClassName } from 'client/types/react';
import { GameType } from 'common/types/game';
import { Card as CardModel } from 'common/types/games/sevenWonders/cards';

import GameImage from 'client/components/common/GameImage/GameImage';

import styles from './Card.module.scss';

interface CardProps extends WithClassName {
  style?: CSSProperties;
  card: CardModel;
  flip?: boolean;
  width?: number;
  isCopiedLeader?: boolean;
  zoomOnHover?: boolean;
}

const Card: FC<CardProps> = (props) => {
  const { className, style, card, flip, width = 110, isCopiedLeader, zoomOnHover } = props;

  return (
    <GameImage
      className={classNames(
        styles.root,
        {
          [styles.flip]: flip,
          [styles.zoomOnHover]: zoomOnHover,
          [styles.isCopiedLeader]: isCopiedLeader,
        },
        className,
      )}
      game={GameType.SEVEN_WONDERS}
      style={style}
      width={width}
      src={`/cards/${card.id}.jpg`}
    />
  );
};

export default memo(Card);
