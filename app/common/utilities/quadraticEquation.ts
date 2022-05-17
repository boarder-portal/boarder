// solves ax^2 + bx + c = 0 equation
export function solveQuadraticEquation(a: number, b: number, c: number): [number, number] {
  const discriminantRoot = Math.sqrt(b ** 2 - 4 * a * c);

  return [(-b - discriminantRoot) / (2 * a), (-b + discriminantRoot) / (2 * a)];
}
