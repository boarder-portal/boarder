import { Card } from 'common/types/games/set';

export default function isSet(cards: Card[]): boolean {
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
