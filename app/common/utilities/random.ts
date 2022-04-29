export function getRandomIndex(length: number): number {
  return Math.floor(Math.random() * length);
}

export function getRandomElement<T>(array: T[]): T {
  return array[getRandomIndex(array.length)];
}
