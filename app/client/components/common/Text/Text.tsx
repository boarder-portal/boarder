import classNames from 'classnames';
import { HTMLAttributes, ReactNode, forwardRef } from 'react';

import styles from './Text.module.scss';

interface TextProps extends HTMLAttributes<HTMLDivElement> {
  size?: 's' | 'm' | 'l' | 'xl' | 'xxl';
  weight?: 'normal' | 'bold';
  withEllipsis?: boolean;
  children?: ReactNode;
}

const Text = forwardRef<HTMLDivElement | null, TextProps>((props, ref) => {
  const { className, size = 'm', weight = 'normal', withEllipsis, children, ...restProps } = props;

  return (
    <div
      className={classNames(
        styles.root,
        styles[`size_${size}`],
        styles[`weight_${weight}`],
        { [styles.withEllipsis]: withEllipsis },
        className,
      )}
      ref={ref}
      {...restProps}
    >
      {children}
    </div>
  );
});

Text.displayName = 'Text';

export default Text;
