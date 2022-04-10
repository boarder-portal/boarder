import { GAMES_CONFIG } from 'common/constants/gamesConfig';

import { ISevenWondersPlayer } from 'common/types/sevenWonders';
import { TSevenWondersEffect } from 'common/types/sevenWonders/effects';
import { EGame } from 'common/types/game';

const {
  games: {
    [EGame.SEVEN_WONDERS]: {
      allCities,
    },
  },
} = GAMES_CONFIG;

export default function getAllPlayerEffects(player: ISevenWondersPlayer): TSevenWondersEffect[] {
  const citySide = allCities[player.city].sides[player.citySide];

  return [
    ...player.builtCards.map(({ effects }) => effects),
    ...player.builtStages.map(({ index }) => citySide.wonders[index].effects),
    ...citySide.effects,
    ...(player.copiedCard?.effects ?? []),
  ].flat();
}
