import React from 'react';
import styled from 'styled-components';
import block from 'bem-cn';

import Box from 'client/components/common/Box/Box';

interface ICancelActionProps {
  className?: string;
  onCancelCard(): void;
}

const b = block('CancelAction');

const Root = styled(Box)`
  .CancelAction {

  }
`;

const CancelAction: React.FC<ICancelActionProps> = (props) => {
  const { className, onCancelCard } = props;

  return (
    <Root className={b.mix(className)}>
      <div onClick={onCancelCard}>Отменить</div>
    </Root>
  );
};

export default React.memo(CancelAction);
