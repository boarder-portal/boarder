import { CELL_SIZE } from 'client/components/games/bombers/BombersGame/constants';

import { ExplodedDirection } from 'common/types/games/bombers';

export interface RenderExplodedDirectionOptions {
  ctx: CanvasRenderingContext2D;
  explodedDirection: ExplodedDirection;
}

const EDGE_MARGIN = 0.02;

export default function renderExplodedDirection(options: RenderExplodedDirectionOptions): void {
  const { ctx, explodedDirection } = options;

  const startX = (explodedDirection.start.x + EDGE_MARGIN) * CELL_SIZE;
  const startY = (explodedDirection.start.y + EDGE_MARGIN) * CELL_SIZE;
  const width = (explodedDirection.end.x - explodedDirection.start.x + 1 - 2 * EDGE_MARGIN) * CELL_SIZE;
  const height = (explodedDirection.end.y - explodedDirection.start.y + 1 - 2 * EDGE_MARGIN) * CELL_SIZE;

  ctx.fillStyle = '#ffff00aa';

  ctx.fillRect(startX, startY, width, height);
}
