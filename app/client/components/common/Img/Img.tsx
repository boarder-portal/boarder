import React from 'react';
import styled from 'styled-components';
import block from 'bem-cn';

interface IImgProps {
  className?: string;
  url: string;
  width: number | 'max';
  height: number;
  onClick?(e: React.MouseEvent): void;
  onContextMenu?(e: React.MouseEvent): void;
}

const b = block('Img');

const Root = styled.div`
  width: ${({ width }: IImgProps) => (width === 'max' ? '100%' : `${width}px`)};
  height: ${({ height }: IImgProps) => `${height}px`};
  background-image: ${({ url }: IImgProps) => `url(${url})`};
  background-position: center center;
  background-repeat: no-repeat;
  background-size: cover;
  border-radius: 8px;
`;

const Img: React.FC<IImgProps> = (props) => {
  const { className } = props;

  return <Root className={b.mix(className).toString()} {...props} />;
};

export default React.memo(Img);
