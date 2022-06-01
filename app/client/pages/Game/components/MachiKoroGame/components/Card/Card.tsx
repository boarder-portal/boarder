import classNames from 'classnames';
import { CSSProperties, useCallback } from 'react';

import { ECardId, ELandmarkId } from 'common/types/machiKoro';
import typedReactMemo from 'client/types/typedReactMemo';

import Image from 'client/components/common/Image/Image';

import { HOVER_SOUND, playSound } from 'client/sounds';

import styles from './Card.pcss';

interface ICardProps<ID> {
  className?: string;
  style?: CSSProperties;
  id: ID;
  inactive?: boolean;
  zoom?: 'normal' | 'extra';
  onClick?(id: ID): void;
}

const Card = <ID extends ECardId | ELandmarkId>(props: ICardProps<ID>) => {
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
