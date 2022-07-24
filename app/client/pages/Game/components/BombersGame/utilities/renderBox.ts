import { IBox } from 'common/types/bombers';
import { ICoords } from 'common/types';
import { TBombersImages } from 'client/pages/Game/components/BombersGame/types';

import renderCellImage from 'client/pages/Game/components/BombersGame/utilities/renderCellImage';

export interface IRenderBoxOptions {
  ctx: CanvasRenderingContext2D;
  box: IBox;
  coords: ICoords;
  images: TBombersImages;
}

export default function renderBox(options: IRenderBoxOptions): void {
  const { ctx, coords, images } = options;

  renderCellImage(ctx, images.box, coords);
}
