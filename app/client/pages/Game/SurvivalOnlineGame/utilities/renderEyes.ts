import { GAMES_CONFIG } from 'common/constants/gamesConfig';

import { ESurvivalOnlineDirection } from 'common/types/survivalOnline';
import { EGame } from 'common/types';

import renderObject, { ISurvivalOnlineRectInfo } from 'client/pages/Game/SurvivalOnlineGame/utilities/renderObject';

const {
  games: {
    [EGame.SURVIVAL_ONLINE]: {
      cellSize,
    },
  },
} = GAMES_CONFIG;

export default function renderEyes(
  context: CanvasRenderingContext2D,
  startX: number,
  startY: number,
  direction: ESurvivalOnlineDirection,
  rects: ISurvivalOnlineRectInfo[],
) {
  if (direction === ESurvivalOnlineDirection.DOWN || direction === ESurvivalOnlineDirection.LEFT) {
    renderObject({
      context,
      startX: startX + cellSize * 0.2,
      startY: startY + cellSize * 0.2,
      rects,
      width: cellSize * 0.2,
      height: cellSize * 0.2,
    });
  }

  if (direction === ESurvivalOnlineDirection.DOWN || direction === ESurvivalOnlineDirection.RIGHT) {
    renderObject({
      context,
      startX: startX + cellSize * 0.6,
      startY: startY + cellSize * 0.2,
      rects,
      width: cellSize * 0.2,
      height: cellSize * 0.2,
    });
  }
}
