import { OBJECT_PIXELS } from 'client/pages/Game/components/SurvivalOnlineGame/constants/objectPixels';

import { ESurvivalOnlineBiome, ESurvivalOnlineObject, ISurvivalOnlineCell } from 'common/types/survivalOnline';

import renderObject from 'client/pages/Game/components/SurvivalOnlineGame/utilities/renderObject';
import renderEyes from 'client/pages/Game/components/SurvivalOnlineGame/utilities/renderEyes';

export default function renderCell(context: CanvasRenderingContext2D, startX: number, startY: number, cell: ISurvivalOnlineCell | undefined) {
  if (!cell) {
    return;
  }

  const { biome, object } = cell;

  if (biome === ESurvivalOnlineBiome.GRASS) {
    renderObject({ context, startX, startY, rects: OBJECT_PIXELS.grass });
  }

  if (!object) {
    return;
  }

  if (object.type === ESurvivalOnlineObject.TREE) {
    renderObject({ context, startX, startY, rects: OBJECT_PIXELS.tree });
  } else if (object.type === ESurvivalOnlineObject.PLAYER) {
    renderObject({ context, startX, startY, rects: OBJECT_PIXELS.player.body });

    renderEyes(context, startX, startY, object.direction, OBJECT_PIXELS.player.eye);
  } else if (object.type === ESurvivalOnlineObject.BASE) {
    renderObject({ context, startX, startY, rects: OBJECT_PIXELS.base });
  } else if (object.type === ESurvivalOnlineObject.ZOMBIE) {
    renderObject({ context, startX, startY, rects: OBJECT_PIXELS.zombie.body });

    renderEyes(context, startX, startY, object.direction, OBJECT_PIXELS.zombie.eye);
  }
}
