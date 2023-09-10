import { NeighborSide } from 'common/types/games/sevenWonders';

export default function getNeighbor(playerIndex: number, playersCount: number, neighborSide: NeighborSide): number {
  return neighborSide === NeighborSide.LEFT
    ? (playerIndex - 1 + playersCount) % playersCount
    : (playerIndex + 1) % playersCount;
}
