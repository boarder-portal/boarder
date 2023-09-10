import { BombersImages } from 'client/pages/Game/components/BombersGame/types';
import { Coords } from 'common/types';
import { Wall } from 'common/types/bombers';

import renderCellImage from 'client/pages/Game/components/BombersGame/utilities/renderCellImage';

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
