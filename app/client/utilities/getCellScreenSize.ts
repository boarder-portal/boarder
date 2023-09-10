import { Size } from 'common/types';

export default function getCellScreenSize(
  containerEl: HTMLDivElement,
  viewSize: Size,
  occupiedSpace?: Partial<Size>,
): number {
  const cellWidth = (containerEl.offsetWidth - (occupiedSpace?.width ?? 0)) / viewSize.width;
  const cellHeight = (containerEl.offsetHeight - (occupiedSpace?.height ?? 0)) / viewSize.height;

  return Math.floor(Math.min(cellWidth, cellHeight));
}
