import times from 'lodash/times';

import { GAMES_CONFIG } from 'common/constants/gamesConfig';

import { ISurvivalOnlineGameInfoEvent, ISurvivalOnlinePlayer } from 'common/types/survivalOnline';
import { EGame } from 'common/types';

import renderCell from 'client/pages/Game/components/SurvivalOnlineGame/utilities/renderCell';
import renderInventory from 'client/pages/Game/components/SurvivalOnlineGame/utilities/renderInventory';

const {
  games: {
    [EGame.SURVIVAL_ONLINE]: {
      viewSize,
      cellSize,
    },
  },
} = GAMES_CONFIG;

export default function renderMap({
  context,
  gameInfo,
  player,
}: {
  context: CanvasRenderingContext2D;
  gameInfo: ISurvivalOnlineGameInfoEvent;
  player: ISurvivalOnlinePlayer;
}) {
  context.clearRect(0, 0, viewSize.width * cellSize, viewSize.height * cellSize);

  const startX = player.x - Math.floor(viewSize.width / 2);
  const startY = player.y - Math.floor(viewSize.height / 2);

  const { map } = gameInfo;

  times(viewSize.height, (y) => {
    times(viewSize.width, (x) => {
      const cellX = startX + x;
      const cellY = startY + y;

      const cell = map[cellY]?.[cellX];

      renderCell(context, x * cellSize, y * cellSize, cell);
    });
  });

  renderInventory(context);
}
