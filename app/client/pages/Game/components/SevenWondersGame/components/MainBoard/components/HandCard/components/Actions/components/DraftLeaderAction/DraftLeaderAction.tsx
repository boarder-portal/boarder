import React, { useCallback } from 'react';
import styled from 'styled-components';
import block from 'bem-cn';

import { ESevenWondersCardActionType, TSevenWondersAction, TSevenWondersPayments } from 'common/types/sevenWonders';

import Box from 'client/components/common/Box/Box';

interface IDraftLeaderActionProps {
  className?: string;
  onCardAction(action: TSevenWondersAction, payments?: TSevenWondersPayments): void;
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
      type: ESevenWondersCardActionType.PICK_LEADER,
    });
  }, [onCardAction]);

  return (
    <Root className={b.mix(className)} >
      <div onClick={handleSelect}>Выбрать</div>
    </Root>
  );
};

export default React.memo(DraftLeaderAction);
