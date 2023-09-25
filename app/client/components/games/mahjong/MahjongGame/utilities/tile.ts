import { ORIGINAL_TILE_HEIGHT, ORIGINAL_TILE_WIDTH } from 'client/components/games/mahjong/MahjongGame/constants';

export function getTileHeight(width: number): number {
  return (width * ORIGINAL_TILE_HEIGHT) / ORIGINAL_TILE_WIDTH;
}
