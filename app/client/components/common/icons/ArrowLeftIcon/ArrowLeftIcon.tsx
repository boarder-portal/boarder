import { FC } from 'react';

import BaseIcon, { BaseIconProps } from 'client/components/common/icons/BaseIcon/BaseIcon';

interface ArrowLeftIconProps extends BaseIconProps {}

const ArrowLeftIcon: FC<ArrowLeftIconProps> = (props) => {
  return (
    <BaseIcon {...props}>
      <path d="m14 7-5 5 5 5V7z" />
    </BaseIcon>
  );
};

export default ArrowLeftIcon;
