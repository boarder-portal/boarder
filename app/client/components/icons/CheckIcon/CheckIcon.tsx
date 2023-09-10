import { FC } from 'react';

interface CheckIconProps {
  className?: string;
}

const CheckIcon: FC<CheckIconProps> = (props) => {
  const { className } = props;

  return (
    <svg className={className} viewBox="0 0 24 24">
      <path d="M9 16.17 4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
    </svg>
  );
};

export default CheckIcon;
