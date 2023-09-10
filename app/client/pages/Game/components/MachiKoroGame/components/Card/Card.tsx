import classNames from 'classnames';
import { CSSProperties, useCallback } from 'react';

import typedReactMemo from 'client/types/typedReactMemo';
import { CardId, LandmarkId } from 'common/types/games/machiKoro';

import Image from 'client/components/common/Image/Image';

import { HOVER_SOUND, playSound } from 'client/sounds';

import styles from './Card.module.scss';

interface CardProps<ID> {
  className?: string;
  style?: CSSProperties;
  id: ID;
  inactive?: boolean;
  zoom?: 'normal' | 'extra';
  onClick?(id: ID): void;
}

const Card = <ID extends CardId | LandmarkId>(props: CardProps<ID>) => {
  const { className, style, id, inactive, zoom = 'norm', onClick } = props;

  const handleHover = useCallback(() => {
    if (onClick) {
      playSound(HOVER_SOUND);
    }
  }, [onClick]);

  return (
    <Image
      className={classNames(
        styles.root,
        {
          [styles.selectable]: Boolean(onClick),
          [styles.inactive]: Boolean(inactive),
          [styles.extraZoom]: zoom === 'extra',
        },
        className,
      )}
      style={style}
      src={`/machiKoro/${id}.jpg`}
      onClick={() => onClick?.(id)}
      onMouseEnter={handleHover}
    />
  );
};

export default typedReactMemo(Card);
