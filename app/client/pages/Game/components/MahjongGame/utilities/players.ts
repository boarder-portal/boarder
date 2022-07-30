import sortBy from 'lodash/sortBy';

import { ALL_WINDS } from 'common/constants/games/mahjong';

import { IPlayer } from 'common/types/mahjong';

export function sortPlayersByWind(players: IPlayer[]): IPlayer[] {
  return sortBy(players, ({ data }, index) => (data.round ? ALL_WINDS.indexOf(data.round.wind) : index));
}
