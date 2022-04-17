import { ALL_CITIES } from 'common/constants/games/sevenWonders';

import { ESevenWondersCity, ISevenWondersCitySide } from 'common/types/sevenWonders';

export default function getCity(cityId: ESevenWondersCity, citySide: number): ISevenWondersCitySide {
  return ALL_CITIES[cityId].sides[citySide];
}
