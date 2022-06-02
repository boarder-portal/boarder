import { CELL_SIZE } from 'client/pages/Game/components/BombersGame/constants';

import { IExplodedDirection } from 'common/types/bombers';

export interface IRenderExplodedDirectionOptions {
  ctx: CanvasRenderingContext2D;
  explodedDirection: IExplodedDirection;
}

const EDGE_MARGIN = 0.1;

export default function renderExplodedDirection(options: IRenderExplodedDirectionOptions): void {
  const { ctx, explodedDirection } = options;

  const startX = (explodedDirection.start.x + EDGE_MARGIN) * CELL_SIZE;
  const startY = (explodedDirection.start.y + EDGE_MARGIN) * CELL_SIZE;
  const width = (explodedDirection.end.x - explodedDirection.start.x + 1 - 2 * EDGE_MARGIN) * CELL_SIZE;
  const height = (explodedDirection.end.y - explodedDirection.start.y + 1 - 2 * EDGE_MARGIN) * CELL_SIZE;

  ctx.fillStyle = '#ffff00aa';

  ctx.fillRect(startX, startY, width, height);
}
