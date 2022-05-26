import { CELL_SIZE } from 'client/pages/Game/components/BombersGame/constants';

import { IBomb } from 'common/types/bombers';
import { ICoords } from 'common/types';

export interface IRenderBombOptions {
  ctx: CanvasRenderingContext2D;
  bomb: IBomb;
  coords: ICoords;
}

export default function renderBomb(options: IRenderBombOptions): void {
  const { ctx, bomb, coords } = options;

  ctx.fillStyle = 'black';

  ctx.fillRect(coords.x * CELL_SIZE, coords.y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
}
