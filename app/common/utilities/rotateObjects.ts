export default function rotateObjects<T>(array: T[], shift: number): T[] {
  const splitIndex = -(shift % array.length);

  return [
    ...array.slice(splitIndex),
    ...array.slice(0, splitIndex),
  ];
}
