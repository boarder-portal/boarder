import React, { useCallback } from 'react';
import styled from 'styled-components';
import block from 'bem-cn';

import { ECardActionType, TAction, TPayments } from 'common/types/sevenWonders';

import Box from 'client/components/common/Box/Box';

interface IDraftLeaderActionProps {
  className?: string;
  onCardAction(action: TAction, payments?: TPayments): void;
}

const b = block('DraftLeaderAction');

const Root = styled(Box)`
  .PickLeaderActions {

  }
`;

const DraftLeaderAction: React.FC<IDraftLeaderActionProps> = (props) => {
  const { className, onCardAction } = props;

  const handleSelect = useCallback(() => {
    onCardAction({
      type: ECardActionType.PICK_LEADER,
    });
  }, [onCardAction]);

  return (
    <Root className={b.mix(className)} >
      <div onClick={handleSelect}>Выбрать</div>
    </Root>
  );
};

export default React.memo(DraftLeaderAction);
