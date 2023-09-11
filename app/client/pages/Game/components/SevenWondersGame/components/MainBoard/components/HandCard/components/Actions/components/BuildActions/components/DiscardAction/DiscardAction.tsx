import { FC, memo, useCallback, useMemo } from 'react';

import { Action, CardActionType, Payments, Player } from 'common/types/games/sevenWonders';

import getPossibleBuildActions from 'common/utilities/sevenWonders/getPossibleBuildActions';

import Text from 'client/components/common/Text/Text';

import styles from './DiscardAction.module.scss';

interface DiscardActionProps {
  player: Player;
  onCardAction(action: Action, payments?: Payments): void;
}

const DiscardAction: FC<DiscardActionProps> = (props) => {
  const { player, onCardAction } = props;

  const possibleBuildActions = getPossibleBuildActions(player);

  const isAvailable = useMemo(() => {
    return possibleBuildActions.includes(CardActionType.DISCARD);
  }, [possibleBuildActions]);

  const title = useMemo(() => (isAvailable ? 'Продать' : 'Нельзя продать'), [isAvailable]);

  const onClick = useCallback(() => {
    onCardAction({
      type: CardActionType.DISCARD,
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

export default memo(DiscardAction);
