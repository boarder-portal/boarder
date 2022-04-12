import React from 'react';
import styled from 'styled-components';
import block from 'bem-cn';

interface IBackCardProps {
  className?: string;
  style?: React.CSSProperties;
  type: number | 'leader';
  onClick?(): void;
}

const b = block('BackCard');

const Root = styled.img`
  width: 110px;
`;

const BackCard: React.FC<IBackCardProps> = (props) => {
  const { className, style, type, onClick } = props;

  return (
    <Root className={b.mix(className)} src={`/sevenWonders/cards/backs/${type}.png`} style={style} onClick={onClick} />
  );
};

export default React.memo(BackCard);
