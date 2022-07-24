import { EObject, ICell } from 'common/types/bombers';
import { TBombersImages } from 'client/pages/Game/components/BombersGame/types';

import renderBomb from 'client/pages/Game/components/BombersGame/utilities/renderBomb';
import renderBox from 'client/pages/Game/components/BombersGame/utilities/renderBox';
import renderBonus from 'client/pages/Game/components/BombersGame/utilities/renderBonus';
import renderWall from 'client/pages/Game/components/BombersGame/utilities/renderWall';
import renderCellImage from 'client/pages/Game/components/BombersGame/utilities/renderCellImage';

export interface IRenderCellOptions {
  ctx: CanvasRenderingContext2D;
  cell: ICell;
  images: TBombersImages;
}

export default function renderCell(options: IRenderCellOptions): void {
  const { ctx, cell, images } = options;

  renderCellImage(ctx, images.grass, cell, 0);

  if (cell.object?.type === EObject.BOMB) {
    renderBomb({ ctx, bomb: cell.object, coords: cell, images });
  } else if (cell.object?.type === EObject.BOX) {
    renderBox({ ctx, box: cell.object, coords: cell, images });
  } else if (cell.object?.type === EObject.BONUS) {
    renderBonus({ ctx, bonus: cell.object, coords: cell, images });
  } else if (cell.object?.type === EObject.WALL) {
    renderWall({ ctx, wall: cell.object, coords: cell, images });
  }
}
