import sortBy from 'lodash/sortBy';

import { EObject, ICell } from 'common/types/bombers';
import { TBombersImages } from 'client/pages/Game/components/BombersGame/types';

import renderBomb from 'client/pages/Game/components/BombersGame/utilities/renderBomb';
import renderBox from 'client/pages/Game/components/BombersGame/utilities/renderBox';
import renderBonus from 'client/pages/Game/components/BombersGame/utilities/renderBonus';
import renderWall from 'client/pages/Game/components/BombersGame/utilities/renderWall';
import renderCellImage from 'client/pages/Game/components/BombersGame/utilities/renderCellImage';

export interface IRenderCellOptions {
  ctx: CanvasRenderingContext2D;
  cell: ICell;
  images: TBombersImages;
}

const OBJECTS_SORT_VALUES: Record<EObject, number> = {
  [EObject.BONUS]: 0,
  [EObject.WALL]: 1,
  [EObject.BOX]: 2,
  [EObject.BOMB]: 3,
};

export default function renderCell(options: IRenderCellOptions): void {
  const { ctx, cell, images } = options;

  renderCellImage(ctx, images.grass, cell, 0);

  sortBy(cell.objects, ({ type }) => OBJECTS_SORT_VALUES[type]).forEach((object) => {
    if (object.type === EObject.BOMB) {
      renderBomb({ ctx, bomb: object, coords: cell, images });
    } else if (object.type === EObject.BOX) {
      renderBox({ ctx, box: object, coords: cell, images });
    } else if (object.type === EObject.BONUS) {
      renderBonus({ ctx, bonus: object, coords: cell, images });
    } else if (object.type === EObject.WALL) {
      renderWall({ ctx, wall: object, coords: cell, images });
    }
  });
}
