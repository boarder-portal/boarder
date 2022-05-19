import { ALL_CITIES } from 'common/constants/games/sevenWonders';

import { ICitySide, IGamePlayerData } from 'common/types/sevenWonders';

export default function getPlayerCity(playerData: IGamePlayerData): ICitySide {
  return ALL_CITIES[playerData.city].sides[playerData.citySide];
}
