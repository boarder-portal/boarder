import { CELL_SIZE } from 'client/pages/Game/components/BombersGame/constants';

import { IBomb } from 'common/types/bombers';
import { ICoords } from 'common/types';
import { TBombersImages } from 'client/pages/Game/components/BombersGame/types';

import renderCellImage from 'client/pages/Game/components/BombersGame/utilities/renderCellImage';

export interface IRenderBombOptions {
  ctx: CanvasRenderingContext2D;
  bomb: IBomb;
  coords: ICoords;
  images: TBombersImages;
}

const BOMB_SIZE = 0.8;
const SUPER_BOMB_SIZE = 0.96;

export default function renderBomb(options: IRenderBombOptions): void {
  const { ctx, bomb, coords, images } = options;
  const size = bomb.isSuperBomb ? SUPER_BOMB_SIZE : BOMB_SIZE;

  renderCellImage(ctx, images.bomb, coords, (1 - size) / 2);

  if (bomb.isSuperRange) {
    ctx.fillStyle = '#b83dba';

    ctx.beginPath();
    ctx.arc((coords.x + 0.5) * CELL_SIZE, (coords.y + 0.5) * CELL_SIZE, size * 0.15 * CELL_SIZE, 0, 2 * Math.PI);
    ctx.closePath();
    ctx.fill();
  }
}
