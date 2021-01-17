import { GAMES_CONFIG } from 'common/constants/gamesConfig';

import { EGame } from 'common/types/game';

import renderRect from 'client/pages/Game/components/SurvivalOnlineGame/utilities/renderRect';

export interface ISurvivalOnlineRectInfo {
  color: string;
  x: number;
  y: number;
  width: number | { value: number };
  height: number | { value: number };
}

const {
  games: {
    [EGame.SURVIVAL_ONLINE]: {
      cellSize,
    },
  },
} = GAMES_CONFIG;

export default function renderObject({
  context,
  startX,
  startY,
  rects,
  width = cellSize,
  height = cellSize,
}: {
  context: CanvasRenderingContext2D;
  startX: number;
  startY: number;
  rects: ISurvivalOnlineRectInfo[];
  width?: number;
  height?: number;
}) {
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
