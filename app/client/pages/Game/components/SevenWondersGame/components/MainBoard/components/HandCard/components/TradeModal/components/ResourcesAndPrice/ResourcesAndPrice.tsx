import React from 'react';

import { IOwnerResource } from 'client/pages/Game/components/SevenWondersGame/components/MainBoard/types';

import Box from 'client/components/common/Box/Box';

import styles from './ResourceAndPrice.pcss';

interface IResourcesAndPriceProps {
  price: number;
  resources: IOwnerResource[];
  reverse?: boolean;
}

const ResourcesAndPrice: React.FC<IResourcesAndPriceProps> = (props) => {
  const { price, resources, reverse } = props;

  if (!price) {
    return <div />;
  }

  return (
    <Box flex alignItems="center" between={12} reverseDirection={reverse}>
      <div>Монет: {price}</div>

      {Boolean(resources.length) && (
        <Box flex alignItems="center" between={4}>
          {resources.map((resource, index) => (
            <img key={index} className={styles.resource} src={`/sevenWonders/resources/${resource.type}.png`} />
          ))}
        </Box>
      )}
    </Box>
  );
};

export default React.memo(ResourcesAndPrice);
