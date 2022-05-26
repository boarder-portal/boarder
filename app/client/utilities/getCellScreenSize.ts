import { ISize } from 'common/types';

export default function getCellScreenSize(containerEl: HTMLDivElement, viewSize: ISize): number {
  const cellWidth = containerEl.offsetWidth / viewSize.width;
  const cellHeight = containerEl.offsetHeight / viewSize.height;

  return Math.floor(Math.min(cellWidth, cellHeight));
}
