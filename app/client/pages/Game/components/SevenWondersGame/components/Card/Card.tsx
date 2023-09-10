import classNames from 'classnames';
import React, { CSSProperties } from 'react';

import { WithClassName } from 'client/types/react';
import { Card as CardModel } from 'common/types/games/sevenWonders/cards';

import Image from 'client/components/common/Image/Image';

import styles from './Card.module.scss';

interface CardProps extends WithClassName {
  style?: CSSProperties;
  card: CardModel;
  flip?: boolean;
  width?: number;
  isCopiedLeader?: boolean;
  zoomOnHover?: boolean;
}

const Card: React.FC<CardProps> = (props) => {
  const { className, style, card, flip, width = 110, isCopiedLeader, zoomOnHover } = props;

  return (
    <Image
      className={classNames(
        styles.root,
        {
          [styles.flip]: flip,
          [styles.zoomOnHover]: zoomOnHover,
          [styles.isCopiedLeader]: isCopiedLeader,
        },
        className,
      )}
      style={style}
      width={width}
      src={`/sevenWonders/cards/${card.id}.jpg`}
    />
  );
};

export default React.memo(Card);
