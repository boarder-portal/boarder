import { GamePlayerData } from 'common/types/games/sevenWonders';
import { Effect } from 'common/types/games/sevenWonders/effects';

import getPlayerCity from 'common/utilities/games/sevenWonders/getPlayerCity';

export default function getAllPlayerEffects(playerData: GamePlayerData): Effect[] {
  const citySide = getPlayerCity(playerData);

  return [
    ...playerData.builtCards.map(({ effects }) => effects),
    ...playerData.builtStages.map(({ index }) => citySide.wonders[index].effects),
    ...citySide.effects,
    ...(playerData.copiedCard?.effects ?? []),
  ].flat();
}
