import React from 'react';
import classNames from 'classnames';

import { PASS_CARDS_COUNT } from 'common/constants/games/hearts';

import { EHandStage } from 'common/types/hearts';
import { ESuit, ICard } from 'common/types/cards';

import { isHeart, isQueenOfSpades } from 'common/utilities/hearts';

import Box from 'client/components/common/Box/Box';
import Card from 'client/pages/Game/components/HeartsGame/components/Hand/components/Card/Card';

import styles from './Hand.pcss';

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
  stage: EHandStage;
  playedSuit: ESuit | null;
  heartsEnteredPlay: boolean;
  isOwnHand: boolean;
  isFirstTurn: boolean;
  onSelectCard(cardIndex: number): void;
}

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
  const {
    className,
    isActive,
    hand,
    chosenCardsIndexes,
    stage,
    heartsEnteredPlay,
    playedSuit,
    isOwnHand,
    isFirstTurn,
    onSelectCard,
  } = props;

  return (
    <Box
      className={classNames(styles.root, isOwnHand ? styles.ownHand : undefined, className)}
      flex
      column
      alignItems="center"
      between={20}
    >
      <Box flex>
        {hand.map((card, index) => {
          const state = getCardState(card, index, isActive, hand, chosenCardsIndexes, stage, playedSuit, heartsEnteredPlay, isFirstTurn);

          return (
            <Card
              key={index}
              className={classNames(styles.card, styles[state])}
              card={card}
              isVisible={isOwnHand}
              onClick={isOwnHand ? () => onSelectCard(index) : undefined}
            />
          );
        })}
      </Box>
    </Box>
  );
};

export default React.memo(Hand);
