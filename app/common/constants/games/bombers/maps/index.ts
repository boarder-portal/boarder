import DEFAULT_MAP from 'common/constants/games/bombers/maps/default';

import { EMap } from 'common/types/bombers';

const MAPS: Record<EMap, string> = {
  [EMap.DEFAULT]: DEFAULT_MAP,
};

export default MAPS;
