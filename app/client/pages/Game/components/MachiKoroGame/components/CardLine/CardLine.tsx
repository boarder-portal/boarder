import { memo, FC, useMemo } from 'react';
import sortBy from 'lodash/sortBy';
import groupBy from 'lodash/groupBy';

import { ECardId } from 'common/types/machiKoro';

import getCard from 'common/utilities/machiKoro/getCard';

import Flex from 'client/components/common/Flex/Flex';
import Card from 'client/pages/Game/components/MachiKoroGame/components/Card/Card';

interface ICardLineProps {
  className?: string;
  cardClassName?: string;
  cardsIds: ECardId[];
  disabledIds: ECardId[];
  onClick?(id: ECardId): void;
}

const CardLine: FC<ICardLineProps> = (props) => {
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
