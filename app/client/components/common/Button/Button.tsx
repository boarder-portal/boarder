import React from 'react';
import MuiButton from '@material-ui/core/Button';

interface IButtonProps {
  className?: string;
  children: React.ReactNode;
  type?: 'primary' | 'secondary';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  isSubmit?: boolean;
  onClick?(): void;
}

const Button: React.FC<IButtonProps> = (props) => {
  const {
    className,
    disabled = false,
    type = 'primary',
    isSubmit = false,
    size = 'medium',
    children,
    onClick,
  } = props;

  return (
    <MuiButton
      className={className}
      type={isSubmit ? 'submit' : 'button'}
      variant={type === 'primary' ? 'contained' : 'outlined'}
      color="primary"
      size={size}
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </MuiButton>
  );
};

export default React.memo(Button);
