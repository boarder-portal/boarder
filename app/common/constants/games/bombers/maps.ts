import { EMap } from 'common/types/bombers';

const MAPS: Record<EMap, string> = {
  [EMap.CHESS]: `
    2b-b-b-b-b-b-b-b1
    --b-b-b-b-b-b-b--
    wbwwwbwbwbwbwwwbw
    b-w-b-b-b-b-b-w-b
    wbwbwbwbwbwbwbwbw
    b-b-b-b-b-b-b-b-b
    wbwbwbwbwbwbwbwbw
    b-w-b-b-b-b-b-w-b
    wbwwwbwbwbwbwwwbw
    --b-b-b-b-b-b-b--
    0b-b-b-b-b-b-b-b3
  `,
};

export default MAPS;
