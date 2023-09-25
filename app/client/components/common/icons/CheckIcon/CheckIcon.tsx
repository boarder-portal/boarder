import { FC } from 'react';

import BaseIcon, { BaseIconProps } from 'client/components/common/icons/BaseIcon/BaseIcon';

interface CheckIconProps extends BaseIconProps {}

const CheckIcon: FC<CheckIconProps> = (props) => {
  return (
    <BaseIcon {...props}>
      <path d="M9 16.17 4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
    </BaseIcon>
  );
};

export default CheckIcon;
