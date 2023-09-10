import React from 'react';

interface CancelActionProps {
  className?: string;
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
