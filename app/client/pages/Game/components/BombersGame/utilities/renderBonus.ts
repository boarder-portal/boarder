import { EBonus, IBonus } from 'common/types/bombers';
import { ICoords } from 'common/types';
import { TBombersImages, TBomberImage } from 'client/pages/Game/components/BombersGame/types';

import renderCellImage from 'client/pages/Game/components/BombersGame/utilities/renderCellImage';

export interface IRenderBombOptions {
  ctx: CanvasRenderingContext2D;
  bonus: IBonus;
  coords: ICoords;
  images: TBombersImages;
}

const IMAGES_MAP: Record<EBonus, TBomberImage> = {
  [EBonus.BOMB_COUNT]: 'bonusBomb',
  [EBonus.BOMB_RANGE]: 'bonusRange',
  [EBonus.SPEED]: 'bonusSpeed',
  [EBonus.HP]: 'bonusHp',
};

export default function renderBonus(options: IRenderBombOptions): void {
  const { ctx, bonus, coords, images } = options;

  renderCellImage(ctx, images[IMAGES_MAP[bonus.bonusType]], coords);
}
