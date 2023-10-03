import classNames from 'classnames';
import { CSSProperties, useCallback } from 'react';

import { WithClassName } from 'client/types/react';
import typedReactMemo from 'client/types/typedReactMemo';
import { GameType } from 'common/types/game';
import { CardId, LandmarkId } from 'common/types/games/machiKoro';

import GameImage from 'client/components/common/GameImage/GameImage';

import { HOVER_SOUND, playSound } from 'client/sounds';

import styles from './Card.module.scss';

interface CardProps<ID> extends WithClassName {
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
    <GameImage
      className={classNames(
        styles.root,
        {
          [styles.selectable]: Boolean(onClick),
          [styles.inactive]: Boolean(inactive),
          [styles.extraZoom]: zoom === 'extra',
        },
        className,
      )}
      game={GameType.MACHI_KORO}
      style={style}
      src={`/${id}.jpg`}
      onClick={() => onClick?.(id)}
      onMouseEnter={handleHover}
    />
  );
};

export default typedReactMemo(Card);
