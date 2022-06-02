import { CELL_SIZE } from 'client/pages/Game/components/BombersGame/constants';
import { BOMBER_CELL_SIZE, MAX_HP } from 'common/constants/games/bombers';

import { EDirection, IPlayerData } from 'common/types/bombers';

export interface IRenderPlayerOptions {
  ctx: CanvasRenderingContext2D;
  playerData: IPlayerData;
}

const HP_VERTICAL_PROPORTION = 0.15;
const HP_HORIZONTAL_PROPORTION = 0.9;
const HP_EDGE_MARGIN = (1 - HP_HORIZONTAL_PROPORTION) / 2;
const HP_BAR_MARGIN = 0.07;
const HP_BAR_WIDTH = (HP_HORIZONTAL_PROPORTION - (MAX_HP - 1) * HP_BAR_MARGIN) / MAX_HP;
const EYE_WIDTH_PROPORTION = 0.2;
const EYE_EDGE_MARGIN = 0.2;

const BOMBER_SIZE = CELL_SIZE * BOMBER_CELL_SIZE;

export default function renderPlayer(options: IRenderPlayerOptions): void {
  const { ctx, playerData } = options;

  const startX = (playerData.coords.x - BOMBER_CELL_SIZE / 2) * CELL_SIZE;
  const startY = (playerData.coords.y - BOMBER_CELL_SIZE / 2) * CELL_SIZE;

  ctx.fillStyle = 'blue';

  ctx.fillRect(startX, startY, BOMBER_SIZE, BOMBER_SIZE);

  if (playerData.direction === EDirection.LEFT || playerData.direction === EDirection.DOWN) {
    const eyeStartX = startX + EYE_EDGE_MARGIN * BOMBER_SIZE;
    const eyeStartY = startY + EYE_EDGE_MARGIN * BOMBER_SIZE;

    ctx.fillStyle = 'white';

    ctx.fillRect(eyeStartX, eyeStartY, EYE_WIDTH_PROPORTION * BOMBER_SIZE, EYE_WIDTH_PROPORTION * BOMBER_SIZE);
  }

  if (playerData.direction === EDirection.RIGHT || playerData.direction === EDirection.DOWN) {
    const eyeStartX = startX + (1 - EYE_WIDTH_PROPORTION - EYE_EDGE_MARGIN) * BOMBER_SIZE;
    const eyeStartY = startY + EYE_EDGE_MARGIN * BOMBER_SIZE;

    ctx.fillStyle = 'white';

    ctx.fillRect(eyeStartX, eyeStartY, EYE_WIDTH_PROPORTION * BOMBER_SIZE, EYE_WIDTH_PROPORTION * BOMBER_SIZE);
  }

  for (let i = 0; i < MAX_HP; i++) {
    const barStartX = startX + ((HP_BAR_WIDTH + HP_BAR_MARGIN) * i + HP_EDGE_MARGIN) * BOMBER_SIZE;
    const barStartY = startY + (1 - HP_VERTICAL_PROPORTION - HP_EDGE_MARGIN) * BOMBER_SIZE;

    ctx.fillStyle = i < playerData.hp ? 'lime' : 'black';

    ctx.fillRect(barStartX, barStartY, HP_BAR_WIDTH * BOMBER_SIZE, HP_VERTICAL_PROPORTION * BOMBER_SIZE);
  }
}
