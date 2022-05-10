import { SHUFFLE_CARDS_COUNTS } from 'common/constants/games/pexeso';

export const SHUFFLE_PERMUTATIONS: number[][][] = [];

const createShufflePermutations = (cardsCount: number): number[][] => {
  const permutations: number[][] = [];

  const fillPermutations = (currentPermutation: number[]) => {
    if (currentPermutation.length === cardsCount) {
      permutations.push([...currentPermutation]);
    } else {
      for (let i = 0; i < cardsCount; i++) {
        if (i !== currentPermutation.length && !currentPermutation.includes(i)) {
          currentPermutation.push(i);
          fillPermutations(currentPermutation);
          currentPermutation.pop();
        }
      }
    }
  };

  fillPermutations([]);

  return permutations;
};

SHUFFLE_CARDS_COUNTS.forEach((count) => {
  SHUFFLE_PERMUTATIONS[count] = createShufflePermutations(count);
});
