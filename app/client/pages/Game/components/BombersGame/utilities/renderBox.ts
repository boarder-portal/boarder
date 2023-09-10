import { BombersImages } from 'client/pages/Game/components/BombersGame/types';
import { Coords } from 'common/types';
import { Box } from 'common/types/bombers';

import renderCellImage from 'client/pages/Game/components/BombersGame/utilities/renderCellImage';

export interface RenderBoxOptions {
  ctx: CanvasRenderingContext2D;
  box: Box;
  coords: Coords;
  images: BombersImages;
}

export default function renderBox(options: RenderBoxOptions): void {
  const { ctx, coords, images } = options;

  renderCellImage(ctx, images.box, coords);
}
