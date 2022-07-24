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

export default function renderBomb(options: IRenderBombOptions): void {
  const { ctx, coords, images } = options;

  renderCellImage(ctx, images.bomb, coords);
}
