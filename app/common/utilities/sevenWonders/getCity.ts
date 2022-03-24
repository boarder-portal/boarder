import SEVEN_WONDERS_CITIES from 'common/constants/sevenWonders/cities';

import { ESevenWondersCity, ISevenWondersCitySide } from 'common/types/sevenWonders';

export default function getCity(cityId: ESevenWondersCity, citySide: number): ISevenWondersCitySide {
  return SEVEN_WONDERS_CITIES[cityId].sides[citySide];
}
