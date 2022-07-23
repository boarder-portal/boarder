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
  [EMap.HALL]: `
    2-bb-b-bbb-b-bb-1
    -wbw-w-w-w-w-wbw-
    b-b-b-b-b-b-b-b-b
    -w-w-bbb-bbb-w-w-
    bbb-bb--b--bb-bbb
    -wb--bbbwbbb--bw-
    bbb-bb--b--bb-bbb
    -w-w-bbb-bbb-w-w-
    b-b-b-b-b-b-b-b-b
    -wbw-w-w-w-w-wbw-
    0-bb-b-bbb-b-bb-3
  `,
  [EMap.BUG]: `
    2-wb-b-bwb-b-bw-1
    -b-wb-b---b-bw-b-
    w-b-wbwbwbwbw-b-w
    bw-b-wbb-bbw-b-wb
    -bw-bb--w--bb-wb-
    w-bbbwbw-wbwbbb-w
    -bw-bb--w--bb-wb-
    bw-b-wbb-bbw-b-wb
    w-b-wbwbwbwbw-b-w
    -b-wb-b---b-bw-b-
    0-wb-b-bwb-b-bw-3
  `,
  [EMap.BUNKER]: `
    2-b-b-b-b-b-b-b-1
    -wbwbw-wbw-wbwbw-
    bw-w-wbb-bbw-w-wb
    -bwbb--wbw--bbwb-
    w-b-wbwb-bwbw-b-w
    bb-wb-b-w-b-bw-bb
    w-b-wbwb-bwbw-b-w
    -bwbb--wbw--bbwb-
    bw-w-wbb-bbw-w-wb
    -wbwbw-wbw-wbwbw-
    0-b-b-b-b-b-b-b-3
  `,
  [EMap.BUTTERFLY]: `
    2--b-b-b-b-b-b--1
    -wwwb-b-w-b-bwww-
    bw-b-wwb-bww-b-wb
    bwbwbwbwbwbwbwbwb
    -b-b-b-bwb-b-b-b-
    wwbww-b-b-b-wwbww
    -b-b-b-bwb-b-b-b-
    bwbwbwbwbwbwbwbwb
    bw-b-wwb-bww-b-wb
    -wwwb-b-w-b-bwww-
    0--b-b-b-b-b-b--3
  `,
  [EMap.CABINET]: `
    2bwb-b-b-b-b-bwb1
    --w-b-b-b-b-b-w--
    wbwbwbwwwwwbwbwbw
    b-b-b-b-b-b-b-b-b
    wbwbww-bwb-wwbwbw
    b-b-b-b-b-b-b-b-b
    wbwbww-bwb-wwbwbw
    b-b-b-b-b-b-b-b-b
    wbwbwbwwwwwbwbwbw
    --w-b-b-b-b-b-w--
    0bwb-b-b-b-b-bwb3
  `,
  [EMap.RACE]: `
    2--b-b-b-b-b-b--1
    -wb-b-b-b-b-b-bw-
    bw-w-b-b-b-b-w-wb
    bwbwbwbwbwbwbwbwb
    -b-b-b-b-b-b-b-b-
    b-b-b-b-b-b-b-b-b
    -b-b-b-b-b-b-b-b-
    bwbwbwbwbwbwbwbwb
    bw-w-b-b-b-b-w-wb
    -wb-b-b-b-b-b-bw-
    0--b-b-b-b-b-b--3
  `,
};

export default MAPS;
