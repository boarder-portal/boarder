import { VIEW_SIZE } from 'common/constants/games/survivalOnline';

export default function getCellScreenSize(containerEl: HTMLDivElement): number {
  const cellWidth = containerEl.offsetWidth / VIEW_SIZE.width;
  const cellHeight = containerEl.offsetHeight / VIEW_SIZE.height;

  return Math.floor(Math.min(cellWidth, cellHeight));
}
