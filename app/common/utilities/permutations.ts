export function getPermutations<T>(array: T[]): T[][] {
  if (array.length === 0) {
    return [];
  }

  if (array.length === 1) {
    return [array];
  }

  const permutations: T[][] = [];

  array.forEach((element, index) => {
    permutations.push(
      ...getPermutations([...array.slice(0, index), ...array.slice(index + 1)]).map((permutation) => [
        element,
        ...permutation,
      ]),
    );
  });

  return permutations;
}
