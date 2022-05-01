import React from 'react';
import styled from 'styled-components';
import block from 'bem-cn';

import { PASS_CARDS_COUNT } from 'common/constants/games/hearts';

import { EHandStage } from 'common/types/hearts';
import { ESuit, ICard } from 'common/types/cards';

import { isHeart, isQueenOfSpades } from 'common/utilities/hearts';

import Box from 'client/components/common/Box/Box';
import Card from 'client/pages/Game/components/HeartsGame/components/Hand/components/Card/Card';

enum ECardState {
  DEFAULT = 'default',
  SELECTED = 'selected',
  DISABLED = 'disabled',
}

interface IHandProps {
  className?: string;
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

const b = block('Hand');

const Root = styled(Box)`
  &.Hand {
    &_ownHand {
      .Hand__card {
        &_state {
          &_selected {
            transform: translateY(-10px);
          }

          &_default, &_selected {
            cursor: pointer;
          }

          &_disabled {
            background: grey;
            pointer-events: none;
          }
        }
      }
    }
  }
`;

function isCardAllowed(card: ICard, suit: ESuit | null, hand: ICard[], heartsEnteredPlay: boolean, isFirstTurn: boolean): boolean {
  if (hand.some((card) => card.suit === suit)) {
    return card.suit === suit;
  }

  if (isQueenOfSpades(card)) {
    return !isFirstTurn;
  }

  if (!isHeart(card)) {
    return true;
  }

  return !isFirstTurn && (suit !== null || heartsEnteredPlay || hand.every(isHeart));
}

function getCardState(
  card: ICard,
  cardIndex: number,
  isActive: boolean,
  hand: ICard[],
  chosenCardsIndexes: number[],
  stage: EHandStage,
  playedSuit: ESuit | null,
  heartsEnteredPlay: boolean,
  isFirstTurn: boolean,
): ECardState {
  if (stage === EHandStage.PASS) {
    const isSelected = chosenCardsIndexes.includes(cardIndex);

    if (isSelected) {
      return ECardState.SELECTED;
    }

    return chosenCardsIndexes.length === PASS_CARDS_COUNT ? ECardState.DISABLED : ECardState.DEFAULT;
  }

  if (!isActive) {
    return ECardState.DISABLED;
  }

  return isCardAllowed(card, playedSuit, hand, heartsEnteredPlay, isFirstTurn) ? ECardState.DEFAULT : ECardState.DISABLED;
}

const Hand: React.FC<IHandProps> = (props) => {
  const { className, isActive, hand, chosenCardsIndexes, playedCard, stage, heartsEnteredPlay, playedSuit, isOwnHand, isFirstTurn, onSelectCard } = props;

  return (
    <Root className={b({ ownHand: isOwnHand }).mix(className)} flex column alignItems="center" between={20}>
      {playedCard && <Card card={playedCard} isVisible />}

      <Box flex between={4}>
        {hand.map((card, index) => {
          return (
            <Card
              key={index}
              className={b('card', {
                state: getCardState(card, index, isActive, hand, chosenCardsIndexes, stage, playedSuit, heartsEnteredPlay, isFirstTurn),
              })}
              card={card}
              isVisible={isOwnHand}
              onClick={isOwnHand ? () => onSelectCard(index) : undefined}
            />
          );
        })}
      </Box>
    </Root>
  );
};

export default React.memo(Hand);
