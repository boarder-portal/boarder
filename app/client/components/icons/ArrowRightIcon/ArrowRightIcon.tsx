import { FC } from 'react';

interface ArrowRightIconProps {
  className?: string;
}

const ArrowRightIcon: FC<ArrowRightIconProps> = (props) => {
  const { className } = props;

  return (
    <svg className={className} viewBox="0 0 24 24">
      <path d="m10 17 5-5-5-5v10z" />
    </svg>
  );
};

export default ArrowRightIcon;
