import classNames from 'classnames';
import { ButtonHTMLAttributes, forwardRef } from 'react';

import styles from './Button.module.scss';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'contained' | 'outlined';
  size?: 'm' | 's';
  disabled?: boolean;
}

const Button = forwardRef<HTMLButtonElement | null, ButtonProps>((props, ref) => {
  const { className, children, variant = 'contained', size = 'm', disabled, ...restProps } = props;

  return (
    <button
      className={classNames(
        styles.root,
        styles[`variant_${variant}`],
        styles[`size_${size}`],
        { [styles.disabled]: disabled },
        className,
      )}
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
