import { ORIGINAL_TILE_HEIGHT, ORIGINAL_TILE_WIDTH } from 'client/pages/Game/components/MahjongGame/constants';

export function getTileHeight(width: number): number {
  return (width * ORIGINAL_TILE_HEIGHT) / ORIGINAL_TILE_WIDTH;
}
