import React, { CSSProperties } from 'react';
import styled from 'styled-components';
import block from 'bem-cn';

import { ICard } from 'common/types/sevenWonders/cards';

interface ICardProps {
  className?: string;
  style?: CSSProperties;
  card: ICard;
  flip?: boolean
  width?: number;
  isCopiedLeader?: boolean;
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

    &_isCopiedLeader {
      border: 2px solid green;
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
  const { className, style, card, flip, width, isCopiedLeader, zoomOnHover } = props;

  return (
    <Root className={b({ flip, zoomOnHover, isCopiedLeader }).mix(className)} style={style} width={width} src={`/sevenWonders/cards/${card.id}.jpg`} />
  );
};

export default React.memo(Card);
