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

  }
`;

const ResourcesAndPrice: React.FC<IResourcesAndPriceProps> = (props) => {
  const { price, resources, reverse } = props;

  return (
    <Root className={b()} flex between={12} reverseDirection={reverse}>
      <div>Монет: {price}</div>

      {Boolean(resources.length) && (
        <div>
          {resources.map((resource, index) => (
            <div key={index}>{resource.type}</div>
          ))}
        </div>
      )}
    </Root>
  );
};

export default React.memo(ResourcesAndPrice);
