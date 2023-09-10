import React from 'react';

import { OwnerResource } from 'client/pages/Game/components/SevenWondersGame/components/MainBoard/types';

import Flex from 'client/components/common/Flex/Flex';
import Image from 'client/components/common/Image/Image';

import styles from './ResourceAndPrice.module.scss';

interface ResourcesAndPriceProps {
  price: number;
  resources: OwnerResource[];
  reverse?: boolean;
}

const ResourcesAndPrice: React.FC<ResourcesAndPriceProps> = (props) => {
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
            <Image key={index} className={styles.resource} src={`/sevenWonders/resources/${resource.type}.png`} />
          ))}
        </Flex>
      )}
    </Flex>
  );
};

export default React.memo(ResourcesAndPrice);
