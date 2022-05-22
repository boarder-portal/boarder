import { forwardRef, ReactNode } from 'react';
import classNames from 'classnames';

import styles from './Text.pcss';

interface IHeadingProps {
  className?: string;
  size?: 's' | 'm' | 'l' | 'xl' | 'xxl';
  weight?: 'normal' | 'bold';
  children?: ReactNode;
}

const Text = forwardRef<HTMLDivElement | null, IHeadingProps>((props, ref) => {
  const { className, size = 'm', weight = 'normal', children } = props;

  return (
    <div className={classNames(styles.root, styles[`size_${size}`], styles[`weight_${weight}`], className)} ref={ref}>
      {children}
    </div>
  );
});

Text.displayName = 'Text';

export default Text;
