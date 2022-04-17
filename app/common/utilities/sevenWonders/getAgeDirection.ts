import { ENeighborSide } from 'common/types/sevenWonders';

export default function getAgeDirection(age: number): ENeighborSide {
  return age % 2
    ? ENeighborSide.RIGHT
    : ENeighborSide.LEFT;
}
