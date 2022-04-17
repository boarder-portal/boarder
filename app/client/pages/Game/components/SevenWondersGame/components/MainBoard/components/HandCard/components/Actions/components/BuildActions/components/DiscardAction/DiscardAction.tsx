import React, { useCallback, useMemo } from 'react';
import styled from 'styled-components';
import block from 'bem-cn';

import {
  ESevenWondersCardActionType,
  ISevenWondersPlayer,
  TSevenWondersAction,
  TSevenWondersPayments,
} from 'common/types/sevenWonders';

import getPossibleBuildActions from 'common/utilities/sevenWonders/getPossibleBuildActions';

import Box from 'client/components/common/Box/Box';

interface IDiscardActionProps {
  player: ISevenWondersPlayer;
  onCardAction(action: TSevenWondersAction, payments?: TSevenWondersPayments): void;
}

const b = block('DiscardAction');

const Root = styled(Box)`
  .DiscardAction {

  }
`;

const DiscardAction: React.FC<IDiscardActionProps> = (props) => {
  const { player, onCardAction } = props;

  const possibleBuildActions = getPossibleBuildActions(player);

  const isAvailable = useMemo(() => {
    return possibleBuildActions.includes(ESevenWondersCardActionType.DISCARD);
  }, [possibleBuildActions]);

  const title = useMemo(() => isAvailable ? 'Продать' : 'Нельзя продать', [isAvailable]);

  const onClick = useCallback(() => {
    onCardAction({
      type: ESevenWondersCardActionType.DISCARD,
    });
  }, [onCardAction]);

  if (!isAvailable) {
    return null;
  }

  return (
    <Root className={b()} size="s" textAlign="center" onClick={onClick}>
      {title}
    </Root>
  );
};

export default React.memo(DiscardAction);
