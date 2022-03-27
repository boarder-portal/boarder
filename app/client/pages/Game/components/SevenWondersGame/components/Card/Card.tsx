import React, { CSSProperties } from 'react';
import styled from 'styled-components';
import block from 'bem-cn';

import { ISevenWondersCard } from 'common/types/sevenWonders/cards';

import Box from 'client/components/common/Box/Box';

interface ICardProps {
  className?: string;
  style?: CSSProperties;
  card: ISevenWondersCard;
  width?: number;
}

interface IRootProps extends Pick<ICardProps, 'width'>{}

const b = block('Card');

const CARD_WIDTH = 110;
const CARD_PROPORTION = 0.6547;

const Root = styled(Box)`
  width: ${({ width }: IRootProps) => width || CARD_WIDTH}px;
  height: ${({ width }: IRootProps) => (width || CARD_WIDTH) / CARD_PROPORTION}px;

  &:hover {
    position: relative;
    z-index: 21 !important;
  }

  .Card {
    &__img {
      width: 100%;
      height: 100%;
    }
  }
`;

const Card: React.FC<ICardProps> = (props) => {
  const { className, style, card, width } = props;

  return (
    <Root className={b.mix(className)} style={style} width={width}>
      <img className={b('img')} src={`/sevenWonders/cards/${card.id}.jpg`} />
    </Root>
  );
};

export default React.memo(Card);
