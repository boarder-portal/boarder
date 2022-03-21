export function getAllCombinations<T>(sets: T[][]): T[][] {
  if (sets.length === 0) {
    return [];
  }

  const restCombinations = getAllCombinations(sets.slice(1));
  let combinations: T[][] = [];

  sets[0].forEach((value) => {
    combinations = [
      ...combinations,
      ...restCombinations.map((combination) => [
        value,
        ...combination,
      ]),
    ];
  });

  return combinations;
}
