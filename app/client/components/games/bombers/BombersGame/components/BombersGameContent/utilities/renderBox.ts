import { BombersImages } from 'client/components/games/bombers/BombersGame/components/BombersGameContent/types';
import { Coords } from 'common/types';
import { Box } from 'common/types/games/bombers';

import renderCellImage from 'client/components/games/bombers/BombersGame/components/BombersGameContent/utilities/renderCellImage';

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
