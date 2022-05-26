import { CELL_SIZE } from 'client/pages/Game/components/BombersGame/constants';

import { IBox } from 'common/types/bombers';
import { ICoords } from 'common/types';

export interface IRenderBoxOptions {
  ctx: CanvasRenderingContext2D;
  box: IBox;
  coords: ICoords;
}

export default function renderBox(options: IRenderBoxOptions): void {
  const { ctx, box, coords } = options;

  ctx.fillStyle = 'brown';

  ctx.fillRect(coords.x * CELL_SIZE, coords.y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
}
