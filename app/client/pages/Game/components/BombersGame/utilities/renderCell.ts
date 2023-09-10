import sortBy from 'lodash/sortBy';

import { BombersImages } from 'client/pages/Game/components/BombersGame/types';
import { Cell, ObjectType } from 'common/types/bombers';

import renderBomb from 'client/pages/Game/components/BombersGame/utilities/renderBomb';
import renderBonus from 'client/pages/Game/components/BombersGame/utilities/renderBonus';
import renderBox from 'client/pages/Game/components/BombersGame/utilities/renderBox';
import renderCellImage from 'client/pages/Game/components/BombersGame/utilities/renderCellImage';
import renderWall from 'client/pages/Game/components/BombersGame/utilities/renderWall';

export interface RenderCellOptions {
  ctx: CanvasRenderingContext2D;
  cell: Cell;
  images: BombersImages;
}

const OBJECTS_SORT_VALUES: Record<ObjectType, number> = {
  [ObjectType.BONUS]: 0,
  [ObjectType.WALL]: 1,
  [ObjectType.BOX]: 2,
  [ObjectType.BOMB]: 3,
};

export default function renderCell(options: RenderCellOptions): void {
  const { ctx, cell, images } = options;

  renderCellImage(ctx, images.grass, cell, 0);

  sortBy(cell.objects, ({ type }) => OBJECTS_SORT_VALUES[type]).forEach((object) => {
    if (object.type === ObjectType.BOMB) {
      renderBomb({ ctx, bomb: object, coords: cell, images });
    } else if (object.type === ObjectType.BOX) {
      renderBox({ ctx, box: object, coords: cell, images });
    } else if (object.type === ObjectType.BONUS) {
      renderBonus({ ctx, bonus: object, coords: cell, images });
    } else if (object.type === ObjectType.WALL) {
      renderWall({ ctx, wall: object, coords: cell, images });
    }
  });
}
