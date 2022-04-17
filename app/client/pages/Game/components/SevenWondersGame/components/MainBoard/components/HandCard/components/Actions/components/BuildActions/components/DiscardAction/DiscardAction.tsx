import React, { useCallback, useMemo } from 'react';
import styled from 'styled-components';
import block from 'bem-cn';

import {
  ECardActionType,
  IPlayer,
  TAction,
  TPayments,
} from 'common/types/sevenWonders';

import getPossibleBuildActions from 'common/utilities/sevenWonders/getPossibleBuildActions';

import Box from 'client/components/common/Box/Box';

interface IDiscardActionProps {
  player: IPlayer;
  onCardAction(action: TAction, payments?: TPayments): void;
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
    return possibleBuildActions.includes(ECardActionType.DISCARD);
  }, [possibleBuildActions]);

  const title = useMemo(() => isAvailable ? 'Продать' : 'Нельзя продать', [isAvailable]);

  const onClick = useCallback(() => {
    onCardAction({
      type: ECardActionType.DISCARD,
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
