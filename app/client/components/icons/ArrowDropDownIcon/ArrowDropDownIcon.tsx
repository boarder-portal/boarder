import { FC } from 'react';

interface IArrowDropDownIconProps {
  className?: string;
}

const ArrowDropDownIcon: FC<IArrowDropDownIconProps> = (props) => {
  const { className } = props;

  return (
    <svg className={className} viewBox="0 0 24 24">
      <path d="m7 10 5 5 5-5z" />
    </svg>
  );
};

export default ArrowDropDownIcon;
