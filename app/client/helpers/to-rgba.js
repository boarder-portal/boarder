export function toRGBA(color, tr) {
  const red = parseInt(color.slice(1, 3), 16);
  const green = parseInt(color.slice(3, 5), 16);
  const blue = parseInt(color.slice(5), 16);

  return `rgba(${red},${green},${blue},${tr})`;
}
