import { FC } from 'react';

interface ArrowLeftIconProps {
  className?: string;
}

const ArrowLeftIcon: FC<ArrowLeftIconProps> = (props) => {
  const { className } = props;

  return (
    <svg className={className} viewBox="0 0 24 24">
      <path d="m14 7-5 5 5 5V7z" />
    </svg>
  );
};

export default ArrowLeftIcon;
