import React, { CSSProperties } from 'react';
import classNames from 'classnames';

import { ICard } from 'common/types/sevenWonders/cards';

import Image from 'client/components/common/Image/Image';

import styles from './Card.module.scss';

interface ICardProps {
  className?: string;
  style?: CSSProperties;
  card: ICard;
  flip?: boolean;
  width?: number;
  isCopiedLeader?: boolean;
  zoomOnHover?: boolean;
}

const Card: React.FC<ICardProps> = (props) => {
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
