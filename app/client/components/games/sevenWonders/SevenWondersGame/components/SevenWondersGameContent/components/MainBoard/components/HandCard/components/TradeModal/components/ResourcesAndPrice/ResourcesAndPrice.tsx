import { FC, memo } from 'react';

import { OwnerResource } from 'client/components/games/sevenWonders/SevenWondersGame/components/SevenWondersGameContent/components/MainBoard/types';
import { GameType } from 'common/types/game';

import Flex from 'client/components/common/Flex/Flex';
import GameImage from 'client/components/common/GameImage/GameImage';

import styles from './ResourceAndPrice.module.scss';

interface ResourcesAndPriceProps {
  price: number;
  resources: OwnerResource[];
  reverse?: boolean;
}

const ResourcesAndPrice: FC<ResourcesAndPriceProps> = (props) => {
  const { price, resources, reverse } = props;

  if (!price) {
    return <div />;
  }

  return (
    <Flex alignItems="center" between={3} direction={reverse ? 'rowReverse' : 'row'}>
      <div>Монет: {price}</div>

      {Boolean(resources.length) && (
        <Flex alignItems="center" between={1}>
          {resources.map((resource, index) => (
            <GameImage
              key={index}
              className={styles.resource}
              game={GameType.SEVEN_WONDERS}
              src={`/resources/${resource.type}.png`}
            />
          ))}
        </Flex>
      )}
    </Flex>
  );
};

export default memo(ResourcesAndPrice);
