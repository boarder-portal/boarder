import { ICoords, ISize } from 'common/types';

export function drawImage(
  options: {
    ctx: CanvasRenderingContext2D;
    image: HTMLImageElement;
  } & ICoords &
    ISize,
): void {
  const { ctx, image, x, y, width, height } = options;

  ctx.drawImage(image, 0, 0, image.width, image.height, x, y, width, height);
}
