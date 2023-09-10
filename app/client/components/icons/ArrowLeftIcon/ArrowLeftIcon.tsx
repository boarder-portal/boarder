import { FC } from 'react';

import { WithClassName } from 'client/types/react';

interface ArrowLeftIconProps extends WithClassName {}

const ArrowLeftIcon: FC<ArrowLeftIconProps> = (props) => {
  const { className } = props;

  return (
    <svg className={className} viewBox="0 0 24 24">
      <path d="m14 7-5 5 5 5V7z" />
    </svg>
  );
};

export default ArrowLeftIcon;
