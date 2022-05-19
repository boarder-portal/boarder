import { IGamePlayerData } from 'common/types/sevenWonders';
import { TEffect } from 'common/types/sevenWonders/effects';

import getPlayerCity from 'common/utilities/sevenWonders/getPlayerCity';

export default function getAllPlayerEffects(playerData: IGamePlayerData): TEffect[] {
  const citySide = getPlayerCity(playerData);

  return [
    ...playerData.builtCards.map(({ effects }) => effects),
    ...playerData.builtStages.map(({ index }) => citySide.wonders[index].effects),
    ...citySide.effects,
    ...(playerData.copiedCard?.effects ?? []),
  ].flat();
}
