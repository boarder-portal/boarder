import { Direction, Line } from 'common/types/bombers';

export default function getDirectionLine(direction: Direction): Line {
  return direction === Direction.UP || direction === Direction.DOWN ? Line.VERTICAL : Line.HORIZONTAL;
}
