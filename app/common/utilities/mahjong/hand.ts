import { Tile } from 'common/types/games/mahjong';

import { isEqualTilesCallback } from 'common/utilities/mahjong/tiles';

export function getHandWithoutTile(hand: Tile[], tile: Tile): Tile[] {
  const winningTileIndex = hand.findIndex(isEqualTilesCallback(tile));

  if (winningTileIndex === -1) {
    return hand;
  }

  return [...hand.slice(0, winningTileIndex), ...hand.slice(winningTileIndex + 1)];
}
