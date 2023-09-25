import groupBy from 'lodash/groupBy';
import sortBy from 'lodash/sortBy';
import { FC, memo, useMemo } from 'react';

import { WithClassName } from 'client/types/react';
import { CardId } from 'common/types/games/machiKoro';

import getCard from 'common/utilities/games/machiKoro/getCard';

import Flex from 'client/components/common/Flex/Flex';
import Card from 'client/components/games/machiKoro/MachiKoroGame/components/Card/Card';

interface CardLineProps extends WithClassName {
  cardClassName?: string;
  cardsIds: CardId[];
  disabledIds: CardId[];
  onClick?(id: CardId): void;
}

const CardLine: FC<CardLineProps> = (props) => {
  const { className, cardClassName, cardsIds, disabledIds, onClick } = props;

  const groupedCards = useMemo(
    () =>
      sortBy(Object.values(groupBy(cardsIds, (cardId) => cardId)), ([cardId]) => {
        const card = getCard(cardId);

        return card.dice[0] + card.dice.length * 0.1;
      }),
    [cardsIds],
  );

  return (
    <Flex className={className} between={2}>
      {groupedCards.map((group, groupIndex) => (
        <Flex key={groupIndex} direction="column">
          {group.map((cardId, cardIndex) => {
            const disabled = disabledIds.includes(cardId);

            return (
              <Card
                key={cardIndex}
                className={cardClassName}
                style={{ marginTop: `-${cardIndex && 116}%` }}
                id={cardId}
                inactive={disabled}
                onClick={disabled ? undefined : onClick}
              />
            );
          })}
        </Flex>
      ))}
    </Flex>
  );
};

export default memo(CardLine);
