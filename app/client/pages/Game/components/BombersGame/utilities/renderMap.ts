import { IPlayerData, TMap } from 'common/types/bombers';

import renderPlayer from 'client/pages/Game/components/BombersGame/utilities/renderPlayer';
import renderCell from 'client/pages/Game/components/BombersGame/utilities/renderCell';

export interface IRenderMapOptions {
  ctx: CanvasRenderingContext2D;
  map: TMap;
  playersData: IPlayerData[];
}

export default function renderMap(options: IRenderMapOptions): void {
  const { ctx, map, playersData } = options;

  map.forEach((row) => {
    row.forEach((cell) => {
      renderCell({ ctx, cell });
    });
  });

  playersData.forEach((playerData) => {
    if (playerData.hp > 0) {
      renderPlayer({ ctx, playerData });
    }
  });
}
