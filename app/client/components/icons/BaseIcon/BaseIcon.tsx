import { ComponentProps, FC, memo } from 'react';

export interface BaseIconProps extends ComponentProps<'svg'> {}

const BaseIcon: FC<BaseIconProps> = (props) => {
  return <svg width="24px" height="24px" viewBox="0 0 24 24" fill="var(--iconColor, currentColor)" {...props} />;
};

export default memo(BaseIcon);
