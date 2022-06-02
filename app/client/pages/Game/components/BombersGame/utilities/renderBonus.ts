import { CELL_SIZE } from 'client/pages/Game/components/BombersGame/constants';

import { EBonus, IBonus } from 'common/types/bombers';
import { ICoords } from 'common/types';

export interface IRenderBombOptions {
  ctx: CanvasRenderingContext2D;
  bonus: IBonus;
  coords: ICoords;
}

const COLOR_MAP: Record<EBonus, string> = {
  [EBonus.SPEED]: 'cyan',
  [EBonus.BOMB_RANGE]: 'purple',
  [EBonus.HP]: 'lime',
  [EBonus.BOMB_COUNT]: 'red',
};

export default function renderBonus(options: IRenderBombOptions): void {
  const { ctx, bonus, coords } = options;

  ctx.fillStyle = COLOR_MAP[bonus.bonusType];

  ctx.fillRect(coords.x * CELL_SIZE, coords.y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
}
