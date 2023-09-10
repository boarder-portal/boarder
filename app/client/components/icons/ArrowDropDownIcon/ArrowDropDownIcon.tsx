import { FC } from 'react';

import { WithClassName } from 'client/types/react';

interface ArrowDropDownIconProps extends WithClassName {}

const ArrowDropDownIcon: FC<ArrowDropDownIconProps> = (props) => {
  const { className } = props;

  return (
    <svg className={className} viewBox="0 0 24 24">
      <path d="m7 10 5 5 5-5z" />
    </svg>
  );
};

export default ArrowDropDownIcon;
