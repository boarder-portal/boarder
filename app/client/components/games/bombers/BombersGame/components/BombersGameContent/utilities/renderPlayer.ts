import { CELL_SIZE } from 'client/components/games/bombers/BombersGame/components/BombersGameContent/constants';
import { BOMBER_CELL_SIZE, BUFF_DURATIONS, MAX_HP } from 'common/constants/games/bombers';

import { BuffType, Direction } from 'common/types/games/bombers';

import { ClientPlayerData } from 'client/components/games/bombers/BombersGame/components/BombersGameContent/BombersGameContent';

export interface RenderPlayerOptions {
  ctx: CanvasRenderingContext2D;
  playerData: ClientPlayerData;
}

const HP_VERTICAL_PROPORTION = 0.15;
const HP_HORIZONTAL_PROPORTION = 0.9;
const HP_EDGE_MARGIN = (1 - HP_HORIZONTAL_PROPORTION) / 2;
const HP_BAR_MARGIN = 0.08;
const HP_BAR_WIDTH = (HP_HORIZONTAL_PROPORTION - (MAX_HP - 1) * HP_BAR_MARGIN) / MAX_HP;
const EYE_WIDTH_PROPORTION = 0.2;
const EYE_EDGE_MARGIN = 0.2;

const BOMBER_SIZE = CELL_SIZE * BOMBER_CELL_SIZE;
const BUFF_SIZE = BOMBER_SIZE * 0.3;
const BUFF_RADIUS = BUFF_SIZE / 2;
const BUFF_TOP_MARGIN = BOMBER_SIZE * 0.1;
const BUFF_BETWEEN_MARGIN = BUFF_SIZE * 0.1;

const BUFF_COLORS: Record<BuffType, string> = {
  [BuffType.SUPER_SPEED]: '#00bfff',
  [BuffType.SUPER_BOMB]: '#000',
  [BuffType.SUPER_RANGE]: '#b83dba',
  [BuffType.INVINCIBILITY]: '#f00',
  [BuffType.BOMB_INVINCIBILITY]: '#f00',
};

export default function renderPlayer(options: RenderPlayerOptions): void {
  const { ctx, playerData } = options;

  const startX = (playerData.coords.x - BOMBER_CELL_SIZE / 2) * CELL_SIZE;
  const startY = (playerData.coords.y - BOMBER_CELL_SIZE / 2) * CELL_SIZE;

  const renderEye = (x: number, y: number): void => {
    ctx.fillStyle = 'white';

    ctx.fillRect(x, y, EYE_WIDTH_PROPORTION * BOMBER_SIZE, EYE_WIDTH_PROPORTION * BOMBER_SIZE);
  };

  ctx.fillStyle = playerData.color;

  ctx.fillRect(startX, startY, BOMBER_SIZE, BOMBER_SIZE);

  if (playerData.direction === Direction.LEFT || playerData.direction === Direction.DOWN) {
    renderEye(startX + EYE_EDGE_MARGIN * BOMBER_SIZE, startY + EYE_EDGE_MARGIN * BOMBER_SIZE);
  }

  if (playerData.direction === Direction.RIGHT || playerData.direction === Direction.DOWN) {
    renderEye(
      startX + (1 - EYE_WIDTH_PROPORTION - EYE_EDGE_MARGIN) * BOMBER_SIZE,
      startY + EYE_EDGE_MARGIN * BOMBER_SIZE,
    );
  }

  const hpBarWidth = HP_BAR_WIDTH * BOMBER_SIZE;
  const hpBarHeight = HP_VERTICAL_PROPORTION * BOMBER_SIZE;

  ctx.strokeStyle = 'black';
  ctx.lineWidth = hpBarHeight * 0.3;

  for (let i = 0; i < MAX_HP; i++) {
    const barStartX = startX + ((HP_BAR_WIDTH + HP_BAR_MARGIN) * i + HP_EDGE_MARGIN) * BOMBER_SIZE;
    const barStartY = startY + (1 - HP_VERTICAL_PROPORTION - HP_EDGE_MARGIN) * BOMBER_SIZE;

    ctx.fillStyle = i < playerData.properties.hp ? 'lime' : 'black';

    ctx.strokeRect(barStartX, barStartY, hpBarWidth, hpBarHeight);
    ctx.fillRect(barStartX, barStartY, hpBarWidth, hpBarHeight);
  }

  const buffsWidth = playerData.buffs.size * BUFF_SIZE + (playerData.buffs.size - 1) * BUFF_BETWEEN_MARGIN;

  [...playerData.buffs].forEach(({ type, endsAt }, index) => {
    const timeLeftProportion = Math.max(0, endsAt.timeLeft / BUFF_DURATIONS[type]);

    if (timeLeftProportion === 0) {
      return;
    }

    const centerX = startX + BOMBER_SIZE / 2 - buffsWidth / 2 + BUFF_RADIUS + index * (BUFF_SIZE + BUFF_BETWEEN_MARGIN);
    const centerY = startY - BUFF_TOP_MARGIN - BUFF_RADIUS;

    ctx.fillStyle = BUFF_COLORS[type];
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 1;

    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.lineTo(centerX, centerY - BUFF_RADIUS);
    ctx.arc(centerX, centerY, BUFF_RADIUS, -Math.PI / 2, (1.5 - 2 * timeLeftProportion) * Math.PI, true);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  });
}
