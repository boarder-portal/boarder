export function getSetsCombinations<T>(sets: T[][]): T[][] {
  if (sets.length === 0) {
    return [];
  }

  if (sets.length === 1) {
    return sets[0].map((value) => [value]);
  }

  const restCombinations = getSetsCombinations(sets.slice(1));
  let combinations: T[][] = [];

  sets[0].forEach((value) => {
    combinations = [...combinations, ...restCombinations.map((combination) => [value, ...combination])];
  });

  return combinations;
}

export function getCombinations<T>(elements: T[], count: number): T[][] {
  if (count === 0) {
    return [[]];
  }

  if (count > elements.length) {
    return [];
  }

  const combinations: T[][] = [];

  for (let i = 0; i < elements.length - count + 1; i++) {
    combinations.push(
      ...getCombinations(elements.slice(i + 1), count - 1).map((combination) => [elements[i], ...combination]),
    );
  }

  return combinations;
}
