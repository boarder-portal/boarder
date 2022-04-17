import React from 'react';

import { ECardType, IPlayer } from 'common/types/onitama';

import Box from 'client/components/common/Box/Box';
import OnitamaCard from 'client/pages/Game/components/OnitamaGame/OnitamaCard';

interface IOnitamaPlayerProps {
  player: IPlayer;
  fifthCard: ECardType;
  isFlipped: boolean;
  selectedCardIndex: number;
  onCardClick?(card: ECardType): void;
}

const OnitamaPlayer: React.FC<IOnitamaPlayerProps> = (props) => {
  const {
    player,
    fifthCard,
    isFlipped,
    selectedCardIndex,
    onCardClick,
  } = props;

  return (
    <div>
      <Box flex between={8} alignItems="center">
        {player.cards.map((card, index) => (
          <OnitamaCard
            key={card}
            card={card}
            isFlipped={isFlipped}
            isSelected={selectedCardIndex === index}
            onClick={onCardClick}
          />
        ))}

        {player.isActive && (
          <div style={{
            opacity: 0.25,
            transform: 'scale(0.75)',
          }}>
            <OnitamaCard
              card={fifthCard}
              isFlipped={isFlipped}
              isSelected={false}
            />
          </div>
        )}
      </Box>
    </div>
  );
};

export default React.memo(OnitamaPlayer);
