import { OBJECT_PIXELS } from 'client/components/games/survivalOnline/SurvivalOnlineGame/constants/objectPixels';

import { BiomeType, Cell, ObjectType } from 'common/types/games/survivalOnline';

import renderEyes from 'client/components/games/survivalOnline/SurvivalOnlineGame/utilities/renderEyes';
import renderObject from 'client/components/games/survivalOnline/SurvivalOnlineGame/utilities/renderObject';

export default function renderCell(
  context: CanvasRenderingContext2D,
  startX: number,
  startY: number,
  cell: Cell | undefined,
): void {
  if (!cell) {
    return;
  }

  const { biome, object } = cell;

  if (biome === BiomeType.GRASS) {
    renderObject({ context, startX, startY, rects: OBJECT_PIXELS.grass });
  }

  if (!object) {
    return;
  }

  if (object.type === ObjectType.TREE) {
    renderObject({ context, startX, startY, rects: OBJECT_PIXELS.tree });
  } else if (object.type === ObjectType.PLAYER) {
    renderObject({ context, startX, startY, rects: OBJECT_PIXELS.player.body });

    renderEyes(context, startX, startY, object.direction, OBJECT_PIXELS.player.eye);
  } else if (object.type === ObjectType.BASE) {
    renderObject({ context, startX, startY, rects: OBJECT_PIXELS.base });
  } else if (object.type === ObjectType.ZOMBIE) {
    renderObject({ context, startX, startY, rects: OBJECT_PIXELS.zombie.body });

    renderEyes(context, startX, startY, object.direction, OBJECT_PIXELS.zombie.eye);
  }
}
