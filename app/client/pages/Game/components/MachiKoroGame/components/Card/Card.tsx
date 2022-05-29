import classNames from 'classnames';

import { ECardId, ELandmarkId } from 'common/types/machiKoro';
import typedReactMemo from 'client/types/typedReactMemo';

import Image from 'client/components/common/Image/Image';

import styles from './Card.pcss';

interface ICardProps<ID> {
  id: ID;
  inactive?: boolean;
  onClick?(id: ID): void;
}

const Card = <ID extends ECardId | ELandmarkId>(props: ICardProps<ID>) => {
  const { id, inactive, onClick } = props;

  return (
    <Image
      className={classNames(styles.root, {
        [styles.selectable]: Boolean(onClick),
        [styles.inactive]: Boolean(inactive),
      })}
      src={`/machiKoro/${id}.gif`}
      onClick={() => onClick?.(id)}
    />
  );
};

export default typedReactMemo(Card);
