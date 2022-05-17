import React, { useCallback, useMemo } from 'react';

import { ECardActionType, IAgePlayerData, ITurnPlayerData, TAction, TPayments } from 'common/types/sevenWonders';

import getPossibleBuildActions from 'common/utilities/sevenWonders/getPossibleBuildActions';

import Box from 'client/components/common/Box/Box';

interface IDiscardActionProps {
  agePlayerData: IAgePlayerData | null;
  turnPlayerData: ITurnPlayerData | null;
  onCardAction(action: TAction, payments?: TPayments): void;
}

const DiscardAction: React.FC<IDiscardActionProps> = (props) => {
  const { agePlayerData, turnPlayerData, onCardAction } = props;

  const possibleBuildActions = getPossibleBuildActions(
    turnPlayerData?.waitingForAction ?? null,
    agePlayerData?.buildEffects ?? [],
  );

  const isAvailable = useMemo(() => {
    return possibleBuildActions.includes(ECardActionType.DISCARD);
  }, [possibleBuildActions]);

  const title = useMemo(() => (isAvailable ? 'Продать' : 'Нельзя продать'), [isAvailable]);

  const onClick = useCallback(() => {
    onCardAction({
      type: ECardActionType.DISCARD,
    });
  }, [onCardAction]);

  if (!isAvailable) {
    return null;
  }

  return (
    <Box size="s" textAlign="center" onClick={onClick}>
      {title}
    </Box>
  );
};

export default React.memo(DiscardAction);
