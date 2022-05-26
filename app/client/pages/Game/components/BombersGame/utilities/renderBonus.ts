import { CELL_SIZE } from 'client/pages/Game/components/BombersGame/constants';

import { IBonus } from 'common/types/bombers';
import { ICoords } from 'common/types';

export interface IRenderBombOptions {
  ctx: CanvasRenderingContext2D;
  bonus: IBonus;
  coords: ICoords;
}

export default function renderBonus(options: IRenderBombOptions): void {
  const { ctx, bonus, coords } = options;

  ctx.fillStyle = 'red';

  ctx.fillRect(coords.x * CELL_SIZE, coords.y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
}
