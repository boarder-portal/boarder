import React from 'react';
import styled from 'styled-components';
import block from 'bem-cn';

interface IPhotoProps {
  className?: string;
  url: string;
  width: number | 'max';
  height: number;
  onClick?(): void;
}

const b = block('Photo');

const Root = styled.div`
  width: ${({ width }: IPhotoProps) => width === 'max' ? '100%' : `${width}px`};
  height: ${({ height }: IPhotoProps) => `${height}px`};
  background-image: ${({ url }: IPhotoProps) => `url(${url})`};
  background-position: center center;
  background-repeat: no-repeat;
  background-size: cover;
  border-radius: 8px;
`;

const Img: React.FC<IPhotoProps> = (props) => {
  const { className } = props;

  return (
    <Root
      className={b.mix(className).toString()}
      {...props}
    />
  );
};

export default React.memo(Img);
