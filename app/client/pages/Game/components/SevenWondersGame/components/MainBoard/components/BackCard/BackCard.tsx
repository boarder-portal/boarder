import React from 'react';
import styled from 'styled-components';
import block from 'bem-cn';

interface IBackCardProps {
  className?: string;
  style?: React.CSSProperties;
  age: number;
}

const b = block('BackCard');

const Root = styled.img`
  width: 110px;
`;

const BackCard: React.FC<IBackCardProps> = (props) => {
  const { className, style, age } = props;

  return (
    <Root className={b.mix(className)} src={`/sevenWonders/cards/backs/${age}.png`} style={style} />
  );
};

export default React.memo(BackCard);
