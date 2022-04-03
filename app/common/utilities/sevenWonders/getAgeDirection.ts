import { ESevenWondersNeighborSide } from 'common/types/sevenWonders';

export default function getAgeDirection(age: number): ESevenWondersNeighborSide {
  return age % 2
    ? ESevenWondersNeighborSide.RIGHT
    : ESevenWondersNeighborSide.LEFT;
}
