import { FC, memo } from 'react';

import { CardType, Player } from 'common/types/games/onitama';

import Flex from 'client/components/common/Flex/Flex';
import Card from 'client/components/games/onitama/OnitamaGame/components/GameContent/components/Card/Card';

interface PlayerProps {
  player: Player;
  fifthCard: CardType;
  isActive: boolean;
  isFlipped: boolean;
  selectedCardIndex: number;
  onCardClick?(card: CardType): void;
}

const Player: FC<PlayerProps> = (props) => {
  const { player, fifthCard, isActive, isFlipped, selectedCardIndex, onCardClick } = props;

  return (
    <div>
      <Flex between={2} alignItems="center">
        {player.data.cards.map((card, index) => (
          <Card
            key={card}
            card={card}
            isFlipped={isFlipped}
            isSelected={selectedCardIndex === index}
            onClick={onCardClick}
          />
        ))}

        {isActive && (
          <div
            style={{
              opacity: 0.25,
              transform: 'scale(0.75)',
            }}
          >
            <Card card={fifthCard} isFlipped={isFlipped} isSelected={false} />
          </div>
        )}
      </Flex>
    </div>
  );
};

export default memo(Player);
