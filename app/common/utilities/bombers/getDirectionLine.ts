import { Direction, Line } from 'common/types/games/bombers';

export default function getDirectionLine(direction: Direction): Line {
  return direction === Direction.UP || direction === Direction.DOWN ? Line.VERTICAL : Line.HORIZONTAL;
}
