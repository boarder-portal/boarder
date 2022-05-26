import { CELL_SIZE } from 'client/pages/Game/components/BombersGame/constants';

import { IPlayer } from 'common/types/bombers';

export interface IRenderPlayerOptions {
  ctx: CanvasRenderingContext2D;
  player: IPlayer;
}

export default function renderPlayer(options: IRenderPlayerOptions): void {
  const { ctx, player } = options;

  ctx.fillStyle = 'blue';

  ctx.fillRect(
    (player.data.coords.x - 0.5) * CELL_SIZE,
    (player.data.coords.y - 0.5) * CELL_SIZE,
    CELL_SIZE,
    CELL_SIZE,
  );
}
