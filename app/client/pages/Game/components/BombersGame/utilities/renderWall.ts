import { IWall } from 'common/types/bombers';
import { ICoords } from 'common/types';
import { TBombersImages } from 'client/pages/Game/components/BombersGame/types';

import renderCellImage from 'client/pages/Game/components/BombersGame/utilities/renderCellImage';

export interface IRenderWallOptions {
  ctx: CanvasRenderingContext2D;
  wall: IWall;
  coords: ICoords;
  images: TBombersImages;
}

export default function renderWall(options: IRenderWallOptions): void {
  const { ctx, coords, images } = options;

  renderCellImage(ctx, images.wall, coords);
}
