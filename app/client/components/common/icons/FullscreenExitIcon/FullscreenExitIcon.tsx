import { FC, memo } from 'react';

import BaseIcon, { BaseIconProps } from 'client/components/common/icons/BaseIcon/BaseIcon';

interface FullscreenExitIconProps extends BaseIconProps {}

const FullscreenExitIcon: FC<FullscreenExitIconProps> = (props) => {
  return (
    <BaseIcon {...props}>
      <path d="M0 0h24v24H0V0z" fill="none" />
      <path d="M6 16h2v2c0 .55.45 1 1 1s1-.45 1-1v-3c0-.55-.45-1-1-1H6c-.55 0-1 .45-1 1s.45 1 1 1zm2-8H6c-.55 0-1 .45-1 1s.45 1 1 1h3c.55 0 1-.45 1-1V6c0-.55-.45-1-1-1s-1 .45-1 1v2zm7 11c.55 0 1-.45 1-1v-2h2c.55 0 1-.45 1-1s-.45-1-1-1h-3c-.55 0-1 .45-1 1v3c0 .55.45 1 1 1zm1-11V6c0-.55-.45-1-1-1s-1 .45-1 1v3c0 .55.45 1 1 1h3c.55 0 1-.45 1-1s-.45-1-1-1h-2z" />
    </BaseIcon>
  );
};

export default memo(FullscreenExitIcon);
