import { ISevenWondersPlayer } from 'common/types/sevenWonders';
import { TSevenWondersEffect } from 'common/types/sevenWonders/effects';

import getCity from 'common/utilities/sevenWonders/getCity';

export default function getAllPlayerEffects(player: ISevenWondersPlayer): TSevenWondersEffect[] {
  const citySide = getCity(player.city, player.citySide);

  return [
    ...player.builtCards.map(({ effects }) => effects),
    ...player.builtStages.map(({ index }) => citySide.wonders[index].effects),
    ...citySide.effects,
    ...(player.copiedCard?.effects ?? []),
  ].flat();
}
