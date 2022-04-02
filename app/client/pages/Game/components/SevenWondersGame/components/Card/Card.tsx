import React, { CSSProperties } from 'react';
import styled from 'styled-components';
import block from 'bem-cn';

import { ISevenWondersCard } from 'common/types/sevenWonders/cards';

interface ICardProps {
  className?: string;
  style?: CSSProperties;
  card: ISevenWondersCard;
  width?: number;
}

interface IRootProps extends Pick<ICardProps, 'width'>{}

const b = block('Card');

const CARD_WIDTH = 110;

const Root = styled.img`
  width: ${({ width }: IRootProps) => width || CARD_WIDTH}px;

  &:hover {
    position: relative;
    z-index: 21 !important;
  }
`;

const Card: React.FC<ICardProps> = (props) => {
  const { className, style, card, width } = props;

  return (
    <Root className={b.mix(className)} style={style} width={width} src={`/sevenWonders/cards/${card.id}.jpg`} />
  );
};

export default React.memo(Card);
