import React from 'react';

import { WithClassName } from 'client/types/react';

interface CancelActionProps extends WithClassName {
  onCancelCard(): void;
}

const CancelAction: React.FC<CancelActionProps> = (props) => {
  const { className, onCancelCard } = props;

  return (
    <div className={className}>
      <div onClick={onCancelCard}>Отменить</div>
    </div>
  );
};

export default React.memo(CancelAction);
