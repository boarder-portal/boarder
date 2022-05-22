import React, { useCallback } from 'react';

import { ECardActionType, TAction, TPayments } from 'common/types/sevenWonders';

interface IDraftLeaderActionProps {
  className?: string;
  onCardAction(action: TAction, payments?: TPayments): void;
}

const DraftLeaderAction: React.FC<IDraftLeaderActionProps> = (props) => {
  const { className, onCardAction } = props;

  const handleSelect = useCallback(() => {
    onCardAction({
      type: ECardActionType.PICK_LEADER,
    });
  }, [onCardAction]);

  return (
    <div className={className}>
      <div onClick={handleSelect}>Выбрать</div>
    </div>
  );
};

export default React.memo(DraftLeaderAction);
