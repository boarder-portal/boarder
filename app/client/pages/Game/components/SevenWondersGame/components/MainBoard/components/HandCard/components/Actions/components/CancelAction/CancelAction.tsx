import React from 'react';

interface ICancelActionProps {
  className?: string;
  onCancelCard(): void;
}

const CancelAction: React.FC<ICancelActionProps> = (props) => {
  const { className, onCancelCard } = props;

  return (
    <div className={className}>
      <div onClick={onCancelCard}>Отменить</div>
    </div>
  );
};

export default React.memo(CancelAction);
