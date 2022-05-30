import { ButtonHTMLAttributes, forwardRef } from 'react';
import classNames from 'classnames';

import styles from './Button.pcss';

interface IButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  className?: string;
  variant?: 'contained' | 'outlined';
  size?: 'm' | 's';
  disabled?: boolean;
}

const Button = forwardRef<HTMLButtonElement | null, IButtonProps>((props, ref) => {
  const { className, children, variant = 'contained', size = 'm', disabled, ...restProps } = props;

  return (
    <button
      className={classNames(styles.root, styles[variant], styles[size], { [styles.disabled]: disabled }, className)}
      disabled={disabled}
      ref={ref}
      {...restProps}
    >
      {children}
    </button>
  );
});

Button.displayName = 'Button';

export default Button;
