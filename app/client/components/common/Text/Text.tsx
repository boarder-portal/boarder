import classNames from 'classnames';
import { HTMLAttributes, ReactNode, forwardRef } from 'react';

import styles from './Text.module.scss';

interface TextProps extends HTMLAttributes<HTMLDivElement> {
  className?: string;
  size?: 's' | 'm' | 'l' | 'xl' | 'xxl';
  weight?: 'normal' | 'bold';
  children?: ReactNode;
}

const Text = forwardRef<HTMLDivElement | null, TextProps>((props, ref) => {
  const { className, size = 'm', weight = 'normal', children, ...restProps } = props;

  return (
    <div
      className={classNames(styles.root, styles[`size_${size}`], styles[`weight_${weight}`], className)}
      ref={ref}
      {...restProps}
    >
      {children}
    </div>
  );
});

Text.displayName = 'Text';

export default Text;
