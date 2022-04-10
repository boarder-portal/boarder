import React, { CSSProperties } from 'react';
import styled from 'styled-components';
import block from 'bem-cn';

import { ISevenWondersCard } from 'common/types/sevenWonders/cards';

interface ICardProps {
  className?: string;
  style?: CSSProperties;
  card: ISevenWondersCard;
  flip?: boolean
  width?: number;
  zoomOnHover?: boolean;
}

interface IRootProps extends Pick<ICardProps, 'width'>{}

const b = block('Card');

const CARD_WIDTH = 110;

const Root = styled.img`
  width: ${({ width }: IRootProps) => width || CARD_WIDTH}px;

  &.Card {
    &_flip {
      transform: scaleX(-1);
    }

    &_zoomOnHover {
      &:hover {
        animation-name: show;
        animation-delay: 0.4s;
        animation-duration: 0.2s;
        animation-fill-mode: forwards;
      }
    }
  }

  &:hover {
    position: relative;
    z-index: 25 !important;
  }

  @keyframes show {
    from {
      transform: scale(1);
    }

    to {
      transform: scale(3) translateY(20px);
    }
  }
`;

const Card: React.FC<ICardProps> = (props) => {
  const { className, style, card, flip, width, zoomOnHover } = props;

  return (
    <Root className={b({ flip, zoomOnHover }).mix(className)} style={style} width={width} src={`/sevenWonders/cards/${card.id}.jpg`} />
  );
};

export default React.memo(Card);
