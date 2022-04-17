import times from 'lodash/times';

import { CELL_SIZE, VIEW_SIZE } from 'common/constants/games/survivalOnline';

import { IGameInfoEvent, IPlayer } from 'common/types/survivalOnline';

import renderCell from 'client/pages/Game/components/SurvivalOnlineGame/utilities/renderCell';
import renderInventory from 'client/pages/Game/components/SurvivalOnlineGame/utilities/renderInventory';

export default function renderMap({
  context,
  gameInfo,
  player,
}: {
  context: CanvasRenderingContext2D;
  gameInfo: IGameInfoEvent;
  player: IPlayer;
}): void {
  context.clearRect(0, 0, VIEW_SIZE.width * CELL_SIZE, VIEW_SIZE.height * CELL_SIZE);

  const startX = player.x - Math.floor(VIEW_SIZE.width / 2);
  const startY = player.y - Math.floor(VIEW_SIZE.height / 2);

  const { map } = gameInfo;

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
