import { memo, FC, useMemo } from 'react';
import groupBy from 'lodash/groupBy';

import { ECardId } from 'common/types/machiKoro';

import getCard from 'common/utilities/machiKoro/getCard';

import Flex from 'client/components/common/Flex/Flex';
import Card from 'client/pages/Game/components/MachiKoroGame/components/Card/Card';

interface IBoardProps {
  board: ECardId[];
  withActions: boolean;
  availableCoins: number;
  builtMajors: ECardId[];
  onSelect(cardId: ECardId): void;
}

const Board: FC<IBoardProps> = (props) => {
  const { board, withActions, availableCoins, builtMajors, onSelect } = props;

  const groupedCards = useMemo(() => Object.values(groupBy(board, (cardId) => cardId)), [board]);

  return (
    <Flex between={2}>
      {groupedCards.map((group, groupIndex) => (
        <Flex key={groupIndex} direction="column">
          {group.map((cardId, cardIndex) => {
            const card = getCard(cardId);
            const alreadyBuilt = builtMajors.includes(cardId);

            return (
              <Card
                key={cardIndex}
                id={cardId}
                inactive={availableCoins < card.cost || alreadyBuilt}
                onClick={!alreadyBuilt && withActions && availableCoins >= card.cost ? onSelect : undefined}
              />
            );
          })}
        </Flex>
      ))}
    </Flex>
  );
};

export default memo(Board);
