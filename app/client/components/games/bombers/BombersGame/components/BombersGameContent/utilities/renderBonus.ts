import {
  BomberImage,
  BombersImages,
} from 'client/components/games/bombers/BombersGame/components/BombersGameContent/types';
import { Coords } from 'common/types';
import { Bonus, BonusType } from 'common/types/games/bombers';

import renderCellImage from 'client/components/games/bombers/BombersGame/components/BombersGameContent/utilities/renderCellImage';

export interface RenderBonusOptions {
  ctx: CanvasRenderingContext2D;
  bonus: Bonus;
  coords: Coords;
  images: BombersImages;
}

const IMAGES_MAP: Record<BonusType, BomberImage> = {
  [BonusType.BOMB_COUNT]: 'bonusBomb',
  [BonusType.BOMB_RANGE]: 'bonusRange',
  [BonusType.SPEED]: 'bonusSpeed',
  [BonusType.HP]: 'bonusHp',
};

export default function renderBonus(options: RenderBonusOptions): void {
  const { ctx, bonus, coords, images } = options;

  renderCellImage(ctx, images[IMAGES_MAP[bonus.bonusType]], coords);
}
