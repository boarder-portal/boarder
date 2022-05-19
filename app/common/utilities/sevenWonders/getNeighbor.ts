import { ENeighborSide } from 'common/types/sevenWonders';

export default function getNeighbor(playerIndex: number, playersCount: number, neighborSide: ENeighborSide): number {
  return neighborSide === ENeighborSide.LEFT
    ? (playerIndex - 1 + playersCount) % playersCount
    : (playerIndex + 1) % playersCount;
}
