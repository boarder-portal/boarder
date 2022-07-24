import { CELL_SIZE } from 'client/pages/Game/components/BombersGame/constants';

import { ICoords } from 'common/types';

import { drawImage } from 'client/utilities/canvas';

const MARGIN = 0.02;

export default function renderCellImage(
  ctx: CanvasRenderingContext2D,
  image: HTMLImageElement,
  coords: ICoords,
  margin: number = MARGIN,
): void {
  drawImage({
    ctx,
    image,
    x: (coords.x + margin) * CELL_SIZE,
    y: (coords.y + margin) * CELL_SIZE,
    width: (1 - 2 * margin) * CELL_SIZE,
    height: (1 - 2 * margin) * CELL_SIZE,
  });
}
