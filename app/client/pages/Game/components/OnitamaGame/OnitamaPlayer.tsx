import React from 'react';

import { ECardType, IPlayer } from 'common/types/onitama';

import OnitamaCard from 'client/pages/Game/components/OnitamaGame/OnitamaCard';
import Flex from 'client/components/common/Flex/Flex';

interface IOnitamaPlayerProps {
  player: IPlayer;
  fifthCard: ECardType;
  isActive: boolean;
  isFlipped: boolean;
  selectedCardIndex: number;
  onCardClick?(card: ECardType): void;
}

const OnitamaPlayer: React.FC<IOnitamaPlayerProps> = (props) => {
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
