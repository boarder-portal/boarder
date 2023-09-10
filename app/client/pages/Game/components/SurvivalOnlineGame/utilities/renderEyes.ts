import { CELL_SIZE } from 'common/constants/games/survivalOnline';

import { Direction } from 'common/types/survivalOnline';

import renderObject, {
  SurvivalOnlineRectInfo,
} from 'client/pages/Game/components/SurvivalOnlineGame/utilities/renderObject';

export default function renderEyes(
  context: CanvasRenderingContext2D,
  startX: number,
  startY: number,
  direction: Direction,
  rects: SurvivalOnlineRectInfo[],
): void {
  if (direction === Direction.DOWN || direction === Direction.LEFT) {
    renderObject({
      context,
      startX: startX + CELL_SIZE * 0.2,
      startY: startY + CELL_SIZE * 0.2,
      rects,
      width: CELL_SIZE * 0.2,
      height: CELL_SIZE * 0.2,
    });
  }

  if (direction === Direction.DOWN || direction === Direction.RIGHT) {
    renderObject({
      context,
      startX: startX + CELL_SIZE * 0.6,
      startY: startY + CELL_SIZE * 0.2,
      rects,
      width: CELL_SIZE * 0.2,
      height: CELL_SIZE * 0.2,
    });
  }
}
