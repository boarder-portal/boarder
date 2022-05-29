import reduce from 'lodash/reduce';

import hasOwnProperty from 'common/utilities/hasOwnProperty';

export function getRandomIndex(length: number): number {
  return Math.floor(Math.random() * length);
}

export function getRandomElement<T>(array: T[]): T {
  return array[getRandomIndex(array.length)];
}

export function getWeightedRandomKey<K extends keyof any>(weightsMap: Record<K, number>): K {
  const weightsSum = reduce(weightsMap, (sum, weight) => sum + weight, 0);
  let currentSum = Math.random() * weightsSum;

  for (const key in weightsMap) {
    if (hasOwnProperty(weightsMap, key)) {
      currentSum -= weightsMap[key];

      if (currentSum < 0) {
        return key;
      }
    }
  }

  throw new Error('Weighted random failed');
}
