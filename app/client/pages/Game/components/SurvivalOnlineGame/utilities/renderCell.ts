import { OBJECT_PIXELS } from 'client/pages/Game/components/SurvivalOnlineGame/constants/objectPixels';

import { EBiome, EObject, ICell } from 'common/types/survivalOnline';

import renderObject from 'client/pages/Game/components/SurvivalOnlineGame/utilities/renderObject';
import renderEyes from 'client/pages/Game/components/SurvivalOnlineGame/utilities/renderEyes';

export default function renderCell(context: CanvasRenderingContext2D, startX: number, startY: number, cell: ICell | undefined): void {
  if (!cell) {
    return;
  }

  const { biome, object } = cell;

  if (biome === EBiome.GRASS) {
    renderObject({ context, startX, startY, rects: OBJECT_PIXELS.grass });
  }

  if (!object) {
    return;
  }

  if (object.type === EObject.TREE) {
    renderObject({ context, startX, startY, rects: OBJECT_PIXELS.tree });
  } else if (object.type === EObject.PLAYER) {
    renderObject({ context, startX, startY, rects: OBJECT_PIXELS.player.body });

    renderEyes(context, startX, startY, object.direction, OBJECT_PIXELS.player.eye);
  } else if (object.type === EObject.BASE) {
    renderObject({ context, startX, startY, rects: OBJECT_PIXELS.base });
  } else if (object.type === EObject.ZOMBIE) {
    renderObject({ context, startX, startY, rects: OBJECT_PIXELS.zombie.body });

    renderEyes(context, startX, startY, object.direction, OBJECT_PIXELS.zombie.eye);
  }
}
