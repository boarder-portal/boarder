import { CELL_SIZE } from 'common/constants/games/survivalOnline';

import { EDirection } from 'common/types/survivalOnline';

import renderObject, { ISurvivalOnlineRectInfo } from 'client/pages/Game/components/SurvivalOnlineGame/utilities/renderObject';

export default function renderEyes(
  context: CanvasRenderingContext2D,
  startX: number,
  startY: number,
  direction: EDirection,
  rects: ISurvivalOnlineRectInfo[],
): void {
  if (direction === EDirection.DOWN || direction === EDirection.LEFT) {
    renderObject({
      context,
      startX: startX + CELL_SIZE * 0.2,
      startY: startY + CELL_SIZE * 0.2,
      rects,
      width: CELL_SIZE * 0.2,
      height: CELL_SIZE * 0.2,
    });
  }

  if (direction === EDirection.DOWN || direction === EDirection.RIGHT) {
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
