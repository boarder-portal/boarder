import React from 'react';
import styled from 'styled-components';
import block from 'bem-cn';

import { IOwnerResource } from 'client/pages/Game/components/SevenWondersGame/components/MainBoard/types';

import Box from 'client/components/common/Box/Box';

interface IResourcesAndPriceProps {
  price: number;
  resources: IOwnerResource[];
  reverse?: boolean;
}

const b = block('ResourcesAndPrice');

const Root = styled(Box)`
  .ResourcesAndPrice {
    &__resource {
      width: 35px;
    }
  }
`;

const ResourcesAndPrice: React.FC<IResourcesAndPriceProps> = (props) => {
  const { price, resources, reverse } = props;

  return (
    <Root className={b()} flex alignItems="center" between={12} reverseDirection={reverse}>
      <div>Монет: {price}</div>

      {Boolean(resources.length) && (
        <Box flex alignItems="center" between={4}>
          {resources.map((resource, index) => (
            <img key={index} className={b('resource')} src={`/sevenWonders/resources/${resource.type}.png`} />
          ))}
        </Box>
      )}
    </Root>
  );
};

export default React.memo(ResourcesAndPrice);
