import { ALL_CITIES } from 'common/constants/games/sevenWonders';

import { ECity, ICitySide } from 'common/types/sevenWonders';

export default function getCity(cityId: ECity, citySide: number): ICitySide {
  return ALL_CITIES[cityId].sides[citySide];
}
