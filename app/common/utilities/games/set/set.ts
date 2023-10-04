import { Card } from 'common/types/games/set';

export function isSet(cards: Card[]): boolean {
  if (new Set(cards).size !== 3) {
    return false;
  }

  const colorsSet = new Set(cards.map(({ color }) => color));
  const countsSet = new Set(cards.map(({ count }) => count));
  const fillsSet = new Set(cards.map(({ fill }) => fill));
  const shapesSet = new Set(cards.map(({ shape }) => shape));

  const propsSets = [colorsSet, countsSet, fillsSet, shapesSet];

  for (const propSet of propsSets) {
    const isSameValue = propSet.size === 1;
    const isDiffValues = propSet.size === 3;

    if (!isSameValue && !isDiffValues) {
      return false;
    }
  }

  return true;
}

export function findSet(cards: Card[]): number[] | null {
  for (let i = 0; i < cards.length - 2; i++) {
    const firstCard = cards[i];

    for (let j = i + 1; j < cards.length - 1; j++) {
      const secondCard = cards[j];

      for (let k = j + 1; k < cards.length; k++) {
        const thirdCard = cards[k];

        if (isSet([firstCard, secondCard, thirdCard])) {
          return [i, j, k];
        }
      }
    }
  }

  return null;
}
