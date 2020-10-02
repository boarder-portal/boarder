import React from 'react';
import styled from 'styled-components';

const Root = styled.span`
  white-space: pre-wrap;
`;

const DotSeparator: React.FC = () => {
  return (
    <Root>
      {'  •  '}
    </Root>
  );
};

export default React.memo(DotSeparator);
