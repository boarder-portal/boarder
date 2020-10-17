export function getRandomIndex(length: number) {
  return Math.floor(Math.random() * length);
}

export function getRandomElement<T>(array: T[]): T {
  return array[getRandomIndex(array.length)];
}
