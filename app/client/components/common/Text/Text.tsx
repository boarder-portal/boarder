import { forwardRef, HTMLAttributes, ReactNode } from 'react';
import classNames from 'classnames';

import styles from './Text.module.scss';

interface ITextProps extends HTMLAttributes<HTMLDivElement> {
  className?: string;
  size?: 's' | 'm' | 'l' | 'xl' | 'xxl';
  weight?: 'normal' | 'bold';
  children?: ReactNode;
}

const Text = forwardRef<HTMLDivElement | null, ITextProps>((props, ref) => {
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
