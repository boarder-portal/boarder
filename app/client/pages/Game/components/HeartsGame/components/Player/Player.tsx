import React from 'react';
import styled from 'styled-components';
import block from 'bem-cn';

import { ESuit, ICard } from 'common/types/cards';
import { EHandStage, IPlayer } from 'common/types/hearts';

import { EPlayerPosition } from 'client/pages/Game/components/HeartsGame/utilities/getPlayerPosition';

import Box from 'client/components/common/Box/Box';
import Hand from 'client/pages/Game/components/HeartsGame/components/Hand/Hand';
import Card from 'client/pages/Game/components/HeartsGame/components/Hand/components/Card/Card';

interface IPlayerProps {
  className?: string;
  player: IPlayer;
  position: EPlayerPosition;
  isActive: boolean;
  hand: ICard[];
  chosenCardsIndexes: number[];
  playedCard: ICard | null;
  stage: EHandStage;
  playedSuit: ESuit | null;
  heartsEnteredPlay: boolean;
  isOwnHand: boolean;
  isFirstTurn: boolean;
  onSelectCard(cardIndex: number): void;
}

const b = block('Player');

const Root = styled(Box)`
  &.Player {
    &_left,
    &_right {
      .Player__hand {
        width: 70px;
        transform: rotate(90deg);
      }
    }
  }
`;

const Player: React.FC<IPlayerProps> = (props) => {
  const {
    className,
    player,
    position,
    isActive,
    hand,
    chosenCardsIndexes,
    playedCard,
    stage,
    playedSuit,
    heartsEnteredPlay,
    isOwnHand,
    isFirstTurn,
    onSelectCard,
  } = props;

  return (
    <Root
      className={b({ [position]: true }).mix(className)}
      flex
      alignItems="center"
      column={position === EPlayerPosition.BOTTOM || position === EPlayerPosition.TOP}
      reverseDirection={position === EPlayerPosition.LEFT || position === EPlayerPosition.TOP}
      between={20}
    >
      {playedCard && <Card card={playedCard} isVisible />}

      <Hand
        className={b('hand')}
        isActive={isActive}
        hand={hand}
        chosenCardsIndexes={chosenCardsIndexes}
        stage={stage}
        playedSuit={playedSuit}
        heartsEnteredPlay={heartsEnteredPlay}
        isOwnHand={isOwnHand}
        isFirstTurn={isFirstTurn}
        onSelectCard={onSelectCard}
      />

      <Box className={b('info')} flex column alignItems="center">
        <Box size="xl" bold>{player.login}</Box>
        <Box size="l">{player.score}</Box>
      </Box>
    </Root>
  );
};

export default React.memo(Player);
