import React from 'react';
import classNames from 'classnames';

import { PASS_CARDS_COUNT } from 'common/constants/games/hearts';

import { EHandStage } from 'common/types/hearts';
import { ESuit, ICard } from 'common/types/cards';

import isCardAllowed from 'common/utilities/hearts/isCardAllowed';

import Card from 'client/pages/Game/components/HeartsGame/components/Hand/components/Card/Card';
import Flex from 'client/components/common/Flex/Flex';

import styles from './Hand.module.scss';

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

  return isCardAllowed({ card, suit: playedSuit, hand, heartsEnteredPlay, isFirstTurn })
    ? ECardState.DEFAULT
    : ECardState.DISABLED;
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
