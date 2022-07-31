import { IHandPlayerData, TPlayableTile } from 'common/types/mahjong';

import { isEqualTilesCallback } from 'common/utilities/mahjong/tiles';
import { isMelded } from 'common/utilities/mahjong/sets';

export function getHandWithoutTile(hand: TPlayableTile[], tile: TPlayableTile): TPlayableTile[] {
  const winningTileIndex = hand.findIndex(isEqualTilesCallback(tile));

  if (winningTileIndex === -1) {
    return hand;
  }

  return [...hand.slice(0, winningTileIndex), ...hand.slice(winningTileIndex + 1)];
}

export function isLastTileOfKind(playersData: (IHandPlayerData | null)[], tile: TPlayableTile): boolean {
  return (
    playersData.reduce((count, data) => {
      const { declaredSets = [], discard = [] } = data ?? {};

      return (
        count +
        [...declaredSets.filter(({ set }) => isMelded(set)).flatMap(({ set }) => set.tiles), ...discard].filter(
          isEqualTilesCallback(tile),
        ).length
      );
    }, 0) === 4
  );
}
