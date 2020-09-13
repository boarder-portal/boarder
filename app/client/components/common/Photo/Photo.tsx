import React from 'react';
import styled from 'styled-components';
import block from 'bem-cn';

interface IPhotoProps {
  className?: string;
  url: string;
  width: number | 'max';
  height: number;
}

const b = block('Photo');

const Photo: React.FC<IPhotoProps> = (props) => {
  const { className, url } = props;

  return (
    <div className={b.mix(className)} style={{ backgroundImage: `url(/photos/${url})` }} />
  );
};

export default styled(React.memo(Photo))`
  width: ${({ width }: IPhotoProps) => width === 'max' ? '100%' : `${width}px`};
  height: ${({ height }: IPhotoProps) => `${height}px`};
  background-position: center center;
  background-repeat: no-repeat;
  background-size: cover;
  border-radius: 8px;
`;
