import React from 'react';

import { CardType, Player } from 'common/types/games/onitama';

import Flex from 'client/components/common/Flex/Flex';
import OnitamaCard from 'client/pages/Game/components/OnitamaGame/OnitamaCard';

interface OnitamaPlayerProps {
  player: Player;
  fifthCard: CardType;
  isActive: boolean;
  isFlipped: boolean;
  selectedCardIndex: number;
  onCardClick?(card: CardType): void;
}

const OnitamaPlayer: React.FC<OnitamaPlayerProps> = (props) => {
  const { player, fifthCard, isActive, isFlipped, selectedCardIndex, onCardClick } = props;

  return (
    <div>
      <Flex between={2} alignItems="center">
        {player.data.cards.map((card, index) => (
          <OnitamaCard
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
            <OnitamaCard card={fifthCard} isFlipped={isFlipped} isSelected={false} />
          </div>
        )}
      </Flex>
    </div>
  );
};

export default React.memo(OnitamaPlayer);
