import { Tile } from 'common/types/games/mahjong';

import { isEqualTilesCallback } from 'common/utilities/games/mahjong/tiles';

export function getHandWithoutTile(hand: Tile[], tile: Tile): Tile[] {
  const tileIndex = hand.findIndex(isEqualTilesCallback(tile));

  if (tileIndex === -1) {
    return hand;
  }

  return hand.toSpliced(tileIndex, 1);
}
