import { BombersImages } from 'client/components/games/bombers/BombersGame/components/GameContent/types';
import { Coords } from 'common/types';
import { Wall } from 'common/types/games/bombers';

import renderCellImage from 'client/components/games/bombers/BombersGame/components/GameContent/utilities/renderCellImage';

export interface RenderWallOptions {
  ctx: CanvasRenderingContext2D;
  wall: Wall;
  coords: Coords;
  images: BombersImages;
}

export default function renderWall(options: RenderWallOptions): void {
  const { ctx, coords, images } = options;

  renderCellImage(ctx, images.wall, coords);
}
