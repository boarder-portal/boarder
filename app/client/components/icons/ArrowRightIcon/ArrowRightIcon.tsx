import { FC } from 'react';

import BaseIcon, { BaseIconProps } from 'client/components/icons/BaseIcon/BaseIcon';

interface ArrowRightIconProps extends BaseIconProps {}

const ArrowRightIcon: FC<ArrowRightIconProps> = (props) => {
  return (
    <BaseIcon {...props}>
      <path d="m10 17 5-5-5-5v10z" />
    </BaseIcon>
  );
};

export default ArrowRightIcon;
