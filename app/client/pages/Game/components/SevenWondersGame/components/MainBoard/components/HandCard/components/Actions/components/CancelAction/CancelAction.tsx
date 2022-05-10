import React from 'react';

import Box from 'client/components/common/Box/Box';

interface ICancelActionProps {
  className?: string;
  onCancelCard(): void;
}

const CancelAction: React.FC<ICancelActionProps> = (props) => {
  const { className, onCancelCard } = props;

  return (
    <Box className={className}>
      <div onClick={onCancelCard}>Отменить</div>
    </Box>
  );
};

export default React.memo(CancelAction);
