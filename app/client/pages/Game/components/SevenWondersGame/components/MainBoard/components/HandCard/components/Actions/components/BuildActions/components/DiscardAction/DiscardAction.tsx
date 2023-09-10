import React, { useCallback, useMemo } from 'react';

import { ECardActionType, IPlayer, TAction, TPayments } from 'common/types/sevenWonders';

import getPossibleBuildActions from 'common/utilities/sevenWonders/getPossibleBuildActions';

import Text from 'client/components/common/Text/Text';

import styles from './DiscardAction.module.scss';

interface IDiscardActionProps {
  player: IPlayer;
  onCardAction(action: TAction, payments?: TPayments): void;
}

const DiscardAction: React.FC<IDiscardActionProps> = (props) => {
  const { player, onCardAction } = props;

  const possibleBuildActions = getPossibleBuildActions(player);

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
    <Text className={styles.root} size="s" onClick={onClick}>
      {title}
    </Text>
  );
};

export default React.memo(DiscardAction);
