import classNames from 'classnames';
import { CSSProperties } from 'react';

import { ECardId, ELandmarkId } from 'common/types/machiKoro';
import typedReactMemo from 'client/types/typedReactMemo';

import Image from 'client/components/common/Image/Image';

import styles from './Card.pcss';

interface ICardProps<ID> {
  className?: string;
  style?: CSSProperties;
  id: ID;
  inactive?: boolean;
  onClick?(id: ID): void;
}

const Card = <ID extends ECardId | ELandmarkId>(props: ICardProps<ID>) => {
  const { className, style, id, inactive, onClick } = props;

  return (
    <Image
      className={classNames(
        styles.root,
        {
          [styles.selectable]: Boolean(onClick),
          [styles.inactive]: Boolean(inactive),
        },
        className,
      )}
      style={style}
      src={`/machiKoro/${id}.jpg`}
      onClick={() => onClick?.(id)}
    />
  );
};

export default typedReactMemo(Card);
