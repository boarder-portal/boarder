import { CELL_SIZE } from 'client/pages/Game/components/BombersGame/constants';

import { EObject, ICell } from 'common/types/bombers';

import renderBomb from 'client/pages/Game/components/BombersGame/utilities/renderBomb';
import renderBox from 'client/pages/Game/components/BombersGame/utilities/renderBox';
import renderBonus from 'client/pages/Game/components/BombersGame/utilities/renderBonus';
import renderWall from 'client/pages/Game/components/BombersGame/utilities/renderWall';

export interface IRenderCellOptions {
  ctx: CanvasRenderingContext2D;
  cell: ICell;
}

export default function renderCell(options: IRenderCellOptions): void {
  const { ctx, cell } = options;

  ctx.fillStyle = 'green';

  ctx.fillRect(cell.x * CELL_SIZE, cell.y * CELL_SIZE, CELL_SIZE, CELL_SIZE);

  if (cell.object?.type === EObject.BOMB) {
    renderBomb({ ctx, bomb: cell.object, coords: cell });
  } else if (cell.object?.type === EObject.BOX) {
    renderBox({ ctx, box: cell.object, coords: cell });
  } else if (cell.object?.type === EObject.BONUS) {
    renderBonus({ ctx, bonus: cell.object, coords: cell });
  } else if (cell.object?.type === EObject.WALL) {
    renderWall({ ctx, wall: cell.object, coords: cell });
  }
}
