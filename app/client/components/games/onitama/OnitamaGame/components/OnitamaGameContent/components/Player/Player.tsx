import { FC, memo } from 'react';

import { CardType, Player as PlayerModel } from 'common/types/games/onitama';

import Flex from 'client/components/common/Flex/Flex';
import Card from 'client/components/games/onitama/OnitamaGame/components/OnitamaGameContent/components/Card/Card';

interface PlayerProps {
  player: PlayerModel;
  isActive: boolean;
  isFlipped: boolean;
  selectedCardIndex: number;
  onCardClick?(card: CardType): void;
}

const Player: FC<PlayerProps> = (props) => {
  const { player, isActive, isFlipped, selectedCardIndex, onCardClick } = props;

  return (
    <div>
      <Flex between={2} alignItems="center">
        {player.data.cards.map((card, index) => (
          <Card
            key={card}
            card={card}
            isFlipped={isFlipped}
            isSelected={selectedCardIndex === index}
            isDisabled={isActive && index === player.data.cards.length - 1}
            onClick={onCardClick}
          />
        ))}
      </Flex>
    </div>
  );
};

export default memo(Player);
