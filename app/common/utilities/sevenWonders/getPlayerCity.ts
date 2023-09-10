import { ALL_CITIES } from 'common/constants/games/sevenWonders';

import { CitySide, GamePlayerData } from 'common/types/games/sevenWonders';

export default function getPlayerCity(playerData: GamePlayerData): CitySide {
  return ALL_CITIES[playerData.city].sides[playerData.citySide];
}
