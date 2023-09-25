import { GamePhaseType, NeighborSide } from 'common/types/games/sevenWonders';

export default function getAgeDirection(phase: GamePhaseType | null, age: number | null): NeighborSide {
  if (phase === GamePhaseType.AGE && age !== null) {
    return age % 2 ? NeighborSide.RIGHT : NeighborSide.LEFT;
  }

  return NeighborSide.RIGHT;
}
