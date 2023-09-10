import { CELL_SIZE } from 'common/constants/games/survivalOnline';

import renderRect from 'client/pages/Game/components/SurvivalOnlineGame/utilities/renderRect';

export interface SurvivalOnlineRectInfo {
  color: string;
  x: number;
  y: number;
  width: number | { value: number };
  height: number | { value: number };
}

export default function renderObject({
  context,
  startX,
  startY,
  rects,
  width = CELL_SIZE,
  height = CELL_SIZE,
}: {
  context: CanvasRenderingContext2D;
  startX: number;
  startY: number;
  rects: SurvivalOnlineRectInfo[];
  width?: number;
  height?: number;
}): void {
  rects.forEach((rect) => {
    renderRect(
      context,
      startX + width * rect.x,
      startY + height * rect.y,
      typeof rect.width === 'object' ? rect.width.value : width * rect.width,
      typeof rect.height === 'object' ? rect.height.value : height * rect.height,
      rect.color,
    );
  });
}
