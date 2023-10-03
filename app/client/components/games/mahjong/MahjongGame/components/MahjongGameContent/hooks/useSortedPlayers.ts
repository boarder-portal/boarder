import sortBy from 'lodash/sortBy';

import { ALL_WINDS } from 'common/constants/games/mahjong';

import { Player } from 'common/types/games/mahjong';

import useSharedStoreValue from 'client/hooks/useSharedStoreValue';

export default function useSortedPlayers(players: Player[]): Player[] {
  const [user] = useSharedStoreValue('user');

  const sortedPlayers = sortBy(players, ({ data }, index) => (data.round ? ALL_WINDS.indexOf(data.round.wind) : index));
  const playerIndex = sortedPlayers.findIndex(({ login }) => login === user?.login);

  if (playerIndex === -1) {
    return sortedPlayers;
  }

  return [...sortedPlayers.slice(playerIndex), ...sortedPlayers.slice(0, playerIndex)];
}
