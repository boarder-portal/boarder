import { IPlayer, TMap } from 'common/types/bombers';

import renderPlayer from 'client/pages/Game/components/BombersGame/utilities/renderPlayer';
import renderCell from 'client/pages/Game/components/BombersGame/utilities/renderCell';

export interface IRenderMapOptions {
  ctx: CanvasRenderingContext2D;
  map: TMap;
  players: IPlayer[];
}

export default function renderMap(options: IRenderMapOptions): void {
  const { ctx, map, players } = options;

  map.forEach((row) => {
    row.forEach((cell) => {
      renderCell({ ctx, cell });
    });
  });

  players.forEach((player) => {
    if (player.data.hp > 0) {
      renderPlayer({ ctx, player });
    }
  });
}
