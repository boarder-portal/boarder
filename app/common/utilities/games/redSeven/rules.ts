import { Card, CardColor } from 'common/types/games/redSeven';

import { compareCards, getCardValue, getHighestCard } from 'common/utilities/games/redSeven/cards';

export function checkRule(playerPalettes: Card[][], playerIndex: number, rule: CardColor): boolean {
  const playerPalette = playerPalettes[playerIndex];
  const ruleCards = getRuleCards(playerPalette, rule);

  return playerPalettes.every((palette, index) => {
    if (index === playerIndex) {
      return true;
    }

    return compareCards(ruleCards, getRuleCards(palette, rule));
  });
}

export function getRuleCards(cards: Card[], rule: CardColor): Card[] {
  if (rule === CardColor.RED) {
    const highestCard = getHighestCard(cards);

    return highestCard ? [highestCard] : [];
  }

  if (rule === CardColor.ORANGE) {
    const cardsByValuesMap = new Map<number, Card[]>();

    cards.forEach((card) => {
      const cards = cardsByValuesMap.get(card.value);

      if (cards) {
        cards.push(card);
      } else {
        cardsByValuesMap.set(card.value, [card]);
      }
    });

    let highestCardsSet: Card[] = [];

    cardsByValuesMap.forEach((cards) => {
      if (compareCards(cards, highestCardsSet)) {
        highestCardsSet = cards;
      }
    });

    return highestCardsSet;
  }

  if (rule === CardColor.YELLOW) {
    const cardsByColorsMap = new Map<CardColor, Card[]>();

    cards.forEach((card) => {
      const cards = cardsByColorsMap.get(card.color);

      if (cards) {
        cards.push(card);
      } else {
        cardsByColorsMap.set(card.color, [card]);
      }
    });

    let highestCardsSet: Card[] = [];

    cardsByColorsMap.forEach((cards) => {
      if (compareCards(cards, highestCardsSet)) {
        highestCardsSet = cards;
      }
    });

    return highestCardsSet;
  }

  if (rule === CardColor.GREEN) {
    return cards.filter((card) => card.value % 2 === 0);
  }

  if (rule === CardColor.BLUE) {
    const highestColorsMap = new Map<CardColor, Card>();

    cards.forEach((card) => {
      const highestCard = highestColorsMap.get(card.color);

      if (getCardValue(card) > getCardValue(highestCard)) {
        highestColorsMap.set(card.color, card);
      }
    });

    return [...highestColorsMap.values()];
  }

  if (rule === CardColor.INDIGO) {
    const highestValuesMap = new Map<number, Card>();

    cards.forEach((card) => {
      const highestCard = highestValuesMap.get(card.value);

      if (getCardValue(card) > getCardValue(highestCard)) {
        highestValuesMap.set(card.value, card);
      }
    });

    const straights: Card[][] = [];
    let currentStraight: Card[] = [];

    // up to zero to push the last straight
    for (let value = 7; value >= 0; value--) {
      const card = highestValuesMap.get(value);

      if (!card) {
        if (currentStraight.length > 0) {
          straights.push(currentStraight);

          currentStraight = [];
        }

        continue;
      }

      currentStraight.push(card);
    }

    let highestStraight: Card[] = [];

    straights.forEach((straight) => {
      if (compareCards(straight, highestStraight)) {
        highestStraight = straight;
      }
    });

    return highestStraight;
  }

  if (rule === CardColor.VIOLET) {
    return cards.filter((card) => card.value < 4);
  }

  return [];
}

export function getCanvasRule(canvas: Card[]): CardColor {
  return canvas.at(-1)?.color ?? CardColor.RED;
}
