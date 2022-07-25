import { CELL_SIZE } from 'client/pages/Game/components/BombersGame/constants';
import { TIME_TO_START } from 'common/constants/games/bombers';

import { IExplodedDirection, IPlayer, IPlayerData, TMap } from 'common/types/bombers';
import { TBombersImages } from 'client/pages/Game/components/BombersGame/types';

import renderPlayer from 'client/pages/Game/components/BombersGame/utilities/renderPlayer';
import renderCell from 'client/pages/Game/components/BombersGame/utilities/renderCell';
import renderExplodedDirection from 'client/pages/Game/components/BombersGame/utilities/renderExplodedDirection';
import { now } from 'client/utilities/time';

export interface IRenderMapOptions {
  ctx: CanvasRenderingContext2D;
  map: TMap;
  playersData: IPlayerData[];
  explodedDirections: Set<IExplodedDirection>;
  startsAt: number;
  player: IPlayer | null;
  images: TBombersImages;
}

export default function renderMap(options: IRenderMapOptions): void {
  const { ctx, map, playersData, explodedDirections, startsAt, player, images } = options;

  map.forEach((row) => {
    row.forEach((cell) => {
      renderCell({ ctx, cell, images });
    });
  });

  playersData.forEach((playerData) => {
    if (playerData.hp > 0) {
      renderPlayer({ ctx, playerData });
    }
  });

  explodedDirections.forEach((explodedDirection) => {
    renderExplodedDirection({ ctx, explodedDirection });
  });

  const timeLeftToStart = startsAt - now();

  if (timeLeftToStart > 0 && player) {
    const playerCenterX = player.data.coords.x * CELL_SIZE;
    const playerCenterY = player.data.coords.y * CELL_SIZE;
    const diagonalSize = Math.hypot(ctx.canvas.width, ctx.canvas.height);
    const radius = CELL_SIZE + ((diagonalSize - CELL_SIZE) * (TIME_TO_START - timeLeftToStart)) / TIME_TO_START;

    const gradient = ctx.createRadialGradient(
      playerCenterX,
      playerCenterY,
      radius,
      playerCenterX,
      playerCenterY,
      radius + CELL_SIZE,
    );

    gradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0.5)');

    ctx.fillStyle = gradient;

    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  }

  if (timeLeftToStart > -200) {
    const fontSize = Math.round(ctx.canvas.height / 2);

    ctx.font = `${fontSize}px Verdana, sans-serif`;
    ctx.strokeStyle = '#fff';
    ctx.fillStyle = 'blue';
    ctx.lineWidth = Math.round(fontSize / 20);

    const caption = timeLeftToStart < 0 ? 'GO!' : String(Math.ceil(timeLeftToStart / 1000));
    const { fontBoundingBoxAscent, fontBoundingBoxDescent, width } = ctx.measureText(caption);
    const textX = (ctx.canvas.width - width) / 2;
    const textY = (ctx.canvas.height + fontBoundingBoxAscent - fontBoundingBoxDescent) / 2;

    ctx.strokeText(caption, textX, textY);
    ctx.fillText(caption, textX, textY);
  }
}
