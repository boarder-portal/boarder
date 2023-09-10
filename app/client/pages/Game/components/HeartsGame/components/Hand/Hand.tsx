import classNames from 'classnames';
import React from 'react';

import { PASS_CARDS_COUNT } from 'common/constants/games/hearts';

import { Card as CardModel, Suit } from 'common/types/cards';
import { HandStage } from 'common/types/hearts';

import isCardAllowed from 'common/utilities/hearts/isCardAllowed';

import Flex from 'client/components/common/Flex/Flex';
import Card from 'client/pages/Game/components/HeartsGame/components/Hand/components/Card/Card';

import styles from './Hand.module.scss';

enum CardStateType {
  DEFAULT = 'default',
  SELECTED = 'selected',
  DISABLED = 'disabled',
}

interface HandProps {
  className?: string;
  isActive: boolean;
  hand: CardModel[];
  chosenCardsIndexes: number[];
  stage: HandStage;
  playedSuit: Suit | null;
  heartsEnteredPlay: boolean;
  isOwnHand: boolean;
  isFirstTurn: boolean;
  onSelectCard(cardIndex: number): void;
}

function getCardState(
  card: CardModel,
  cardIndex: number,
  isActive: boolean,
  hand: CardModel[],
  chosenCardsIndexes: number[],
  stage: HandStage,
  playedSuit: Suit | null,
  heartsEnteredPlay: boolean,
  isFirstTurn: boolean,
): CardStateType {
  if (stage === HandStage.PASS) {
    const isSelected = chosenCardsIndexes.includes(cardIndex);

    if (isSelected) {
      return CardStateType.SELECTED;
    }

    return chosenCardsIndexes.length === PASS_CARDS_COUNT ? CardStateType.DISABLED : CardStateType.DEFAULT;
  }

  if (!isActive) {
    return CardStateType.DISABLED;
  }

  return isCardAllowed({ card, suit: playedSuit, hand, heartsEnteredPlay, isFirstTurn })
    ? CardStateType.DEFAULT
    : CardStateType.DISABLED;
}

const Hand: React.FC<HandProps> = (props) => {
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
    <Flex
      className={classNames(styles.root, isOwnHand ? styles.ownHand : undefined, className)}
      direction="column"
      alignItems="center"
      between={5}
    >
      <Flex>
        {hand.map((card, index) => {
          const state = getCardState(
            card,
            index,
            isActive,
            hand,
            chosenCardsIndexes,
            stage,
            playedSuit,
            heartsEnteredPlay,
            isFirstTurn,
          );

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
      </Flex>
    </Flex>
  );
};

export default React.memo(Hand);
