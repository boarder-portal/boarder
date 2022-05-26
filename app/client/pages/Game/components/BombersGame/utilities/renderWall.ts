import { CELL_SIZE } from 'client/pages/Game/components/BombersGame/constants';

import { IWall } from 'common/types/bombers';
import { ICoords } from 'common/types';

export interface IRenderWallOptions {
  ctx: CanvasRenderingContext2D;
  wall: IWall;
  coords: ICoords;
}

export default function renderWall(options: IRenderWallOptions): void {
  const { ctx, wall, coords } = options;

  ctx.fillStyle = 'grey';

  ctx.fillRect(coords.x * CELL_SIZE, coords.y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
}
