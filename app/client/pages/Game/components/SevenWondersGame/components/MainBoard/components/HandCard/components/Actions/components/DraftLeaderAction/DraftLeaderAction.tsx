import React, { useCallback } from 'react';

import { WithClassName } from 'client/types/react';
import { Action, CardActionType, Payments } from 'common/types/games/sevenWonders';

interface DraftLeaderActionProps extends WithClassName {
  onCardAction(action: Action, payments?: Payments): void;
}

const DraftLeaderAction: React.FC<DraftLeaderActionProps> = (props) => {
  const { className, onCardAction } = props;

  const handleSelect = useCallback(() => {
    onCardAction({
      type: CardActionType.PICK_LEADER,
    });
  }, [onCardAction]);

  return (
    <div className={className}>
      <div onClick={handleSelect}>Выбрать</div>
    </div>
  );
};

export default React.memo(DraftLeaderAction);
