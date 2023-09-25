import { CELL_SIZE } from 'client/components/games/bombers/BombersGame/components/GameContent/constants';

import { BombersImages } from 'client/components/games/bombers/BombersGame/components/GameContent/types';
import { Coords } from 'common/types';
import { Bomb } from 'common/types/games/bombers';

import renderCellImage from 'client/components/games/bombers/BombersGame/components/GameContent/utilities/renderCellImage';

export interface RenderBombOptions {
  ctx: CanvasRenderingContext2D;
  bomb: Bomb;
  coords: Coords;
  images: BombersImages;
}

const BOMB_SIZE = 0.8;
const SUPER_BOMB_SIZE = 0.96;

export default function renderBomb(options: RenderBombOptions): void {
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
