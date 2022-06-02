import { EDirection, ELine } from 'common/types/bombers';

export default function getDirectionLine(direction: EDirection): ELine {
  return direction === EDirection.UP || direction === EDirection.DOWN ? ELine.VERTICAL : ELine.HORIZONTAL;
}
