import { EGamePhase, ENeighborSide } from 'common/types/sevenWonders';

export default function getAgeDirection(phase: EGamePhase | null, age: number | null): ENeighborSide {
  if (phase === EGamePhase.AGE && age !== null) {
    return age % 2 ? ENeighborSide.RIGHT : ENeighborSide.LEFT;
  }

  return ENeighborSide.RIGHT;
}
