import { FC } from 'react';

import BaseIcon, { BaseIconProps } from 'client/components/icons/BaseIcon/BaseIcon';

interface ArrowDropDownIconProps extends BaseIconProps {}

const ArrowDropDownIcon: FC<ArrowDropDownIconProps> = (props) => {
  return (
    <BaseIcon {...props}>
      <path d="m7 10 5 5 5-5z" />
    </BaseIcon>
  );
};

export default ArrowDropDownIcon;
