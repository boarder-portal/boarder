import React, { useCallback } from 'react';
import times from 'lodash/times';
import styled from 'styled-components';

import { ICard } from 'common/types/set';

import CardObject from 'client/pages/Game/components/SetGame/components/Card/componetns/CardObject/CardObject';
import Box from 'client/components/common/Box/Box';

interface ICardProps {
  card: ICard;
  isSelected: boolean;
  onClick(card: ICard): void;
}

const BASE_SIZE = typeof window !== 'undefined' && window.innerWidth < 1000 ? 80 : 130;

const Root = styled(Box)`
  width: ${BASE_SIZE}px;
  height: ${BASE_SIZE * 1.5}px;
  border: ${({ isSelected }: Pick<ICardProps, 'isSelected'>) => isSelected ? 2 : 1}px solid black;
  border-radius: 8px;
  cursor: pointer;
`;

const Card: React.FC<ICardProps> = (props) => {
  const { card, isSelected, onClick } = props;

  const handleClick = useCallback(() => {
    onClick(card);
  }, [card, onClick]);

  return (
    <Root
      between={20}
      flex
      column
      alignItems="center"
      justifyContent="center"
      isSelected={isSelected}
      onClick={handleClick}
    >
      {times(card.count).map((objIndex) => (
        <CardObject
          key={objIndex}
          card={card}
        />
      ))}
    </Root>
  );
};

export default React.memo(Card);
