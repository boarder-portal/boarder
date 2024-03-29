import classNames from 'classnames';
import { FC, memo } from 'react';

import { PASS_CARDS_COUNT } from 'common/constants/games/hearts';

import { WithClassName } from 'client/types/react';
import { Card as CardModel, Suit } from 'common/types/game/cards';
import { HandStage } from 'common/types/games/hearts';

import isCardAllowed from 'common/utilities/games/hearts/isCardAllowed';

import Flex from 'client/components/common/Flex/Flex';
import Card from 'client/components/games/hearts/HeartsGame/components/HeartsGameContent/components/Hand/components/Card/Card';

import styles from './Hand.module.scss';

enum CardStateType {
  DEFAULT = 'default',
  SELECTED = 'selected',
  DISABLED = 'disabled',
}

interface HandProps extends WithClassName {
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

const Hand: FC<HandProps> = (props) => {
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

export default memo(Hand);
