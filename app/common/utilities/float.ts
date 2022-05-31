export function areFloatsEqual(float1: number, float2: number, precision = 6): boolean {
  return Math.abs(float1 - float2) < 10 ** -precision;
}

export function isFloatZero(float: number, precision = 6): boolean {
  return areFloatsEqual(float, 0, precision);
}
