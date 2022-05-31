import { CELL_SIZE } from 'client/pages/Game/components/BombersGame/constants';
import { BOMBER_CELL_SIZE } from 'common/constants/games/bombers';

import { IPlayerData } from 'common/types/bombers';

export interface IRenderPlayerOptions {
  ctx: CanvasRenderingContext2D;
  playerData: IPlayerData;
}

export default function renderPlayer(options: IRenderPlayerOptions): void {
  const { ctx, playerData } = options;

  ctx.fillStyle = 'blue';

  ctx.fillRect(
    (playerData.coords.x - BOMBER_CELL_SIZE / 2) * CELL_SIZE,
    (playerData.coords.y - BOMBER_CELL_SIZE / 2) * CELL_SIZE,
    CELL_SIZE * BOMBER_CELL_SIZE,
    CELL_SIZE * BOMBER_CELL_SIZE,
  );
}
