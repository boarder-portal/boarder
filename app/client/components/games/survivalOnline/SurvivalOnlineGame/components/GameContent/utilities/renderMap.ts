import times from 'lodash/times';

import { CELL_SIZE, VIEW_SIZE } from 'common/constants/games/survivalOnline';

import { Map, Player } from 'common/types/games/survivalOnline';

import renderCell from 'client/components/games/survivalOnline/SurvivalOnlineGame/components/GameContent/utilities/renderCell';
import renderInventory from 'client/components/games/survivalOnline/SurvivalOnlineGame/components/GameContent/utilities/renderInventory';

export default function renderMap({
  context,
  map,
  player,
}: {
  context: CanvasRenderingContext2D;
  map: Map;
  player: Player;
}): void {
  context.clearRect(0, 0, VIEW_SIZE.width * CELL_SIZE, VIEW_SIZE.height * CELL_SIZE);

  const startX = player.data.cell.x - Math.floor(VIEW_SIZE.width / 2);
  const startY = player.data.cell.y - Math.floor(VIEW_SIZE.height / 2);

  times(VIEW_SIZE.height, (y) => {
    times(VIEW_SIZE.width, (x) => {
      const cellX = startX + x;
      const cellY = startY + y;

      const cell = map[cellY]?.[cellX];

      renderCell(context, x * CELL_SIZE, y * CELL_SIZE, cell);
    });
  });

  renderInventory(context);
}
