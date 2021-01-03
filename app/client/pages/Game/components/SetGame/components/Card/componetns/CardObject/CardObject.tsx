import React from 'react';
import styled from 'styled-components';

import { ESetCardFill, ESetCardShape, ISetCard } from 'common/types/set';

interface ICardObjectProps {
  card: ISetCard;
}

const isMobile = window.innerWidth < 1000;

const BASE_SIZE = isMobile ? 20 : 42;

const Root = styled.div`
  ${({ card }: ICardObjectProps) => {
    if (card.shape === ESetCardShape.OVAL) {
      return `
        width: ${BASE_SIZE * 1.5}px;
        height: ${BASE_SIZE}px;
        border-radius: ${BASE_SIZE * 0.1}px;
      `;
    } else if (card.shape === ESetCardShape.RHOMBUS) {
      return `
        transform: rotate(45deg);
        width: ${BASE_SIZE * 0.8}px;
        height: ${BASE_SIZE * 0.8}px;
      `;
    }

    return `
      width: ${BASE_SIZE}px;
      height: ${BASE_SIZE}px;
      border-radius: 50%;
    `;
  }}
  ${({ card }: ICardObjectProps) => {
    if (card.fill === ESetCardFill.EMPTY) {
      return `
        border: ${isMobile ? 1 : 3}px solid ${card.color};
      `;
    } else if (card.fill === ESetCardFill.FILLED) {
      return `
        background: ${card.color};
      `;
    }

    return `
      border: ${isMobile ? 1 : 3}px solid ${card.color};
      background: repeating-linear-gradient(
        ${card.shape === ESetCardShape.RHOMBUS ? '45deg' : 'to right'},
        white,
        white ${isMobile ? 1 : 3}px,
        ${card.color} ${isMobile ? 1 : 3}px,
        ${card.color} ${isMobile ? 2 : 6}px
      );
    `;
  }}
`;

const CardObject: React.FC<ICardObjectProps> = (props) => {
  return (
    <Root {...props} />
  );
};

export default React.memo(CardObject);
