import { useMemo } from 'react';
import { groupBy } from 'lodash';
import sortBy from 'lodash/sortBy';

import { ESevenWondersCardType, ISevenWondersCard } from 'common/types/sevenWonders/cards';
import { ISevenWondersPlayer } from 'common/types/sevenWonders';

const GROUPS_COUNT = 4;

export default function useCardGroups(player: ISevenWondersPlayer): ISevenWondersCard[][] {
  return useMemo(() => {
    const groupedCards = Object.entries(groupBy(
      player.builtCards,
      ({ type }) =>
        type === ESevenWondersCardType.RAW_MATERIAL ||
        type === ESevenWondersCardType.MANUFACTURED_GOODS ? 'resources' : type,
    )) as [ESevenWondersCardType | 'resources', ISevenWondersCard[]][];

    const sortedGroups = sortBy(groupedCards, ([type, group]) => {
      if (type === 'resources') {
        return -Infinity;
      }

      return -group.length;
    }).map(([, group]) => group);

    const extraGroups = sortedGroups.slice(GROUPS_COUNT).reverse();

    extraGroups.forEach((extraGroup, index) => {
      sortedGroups[3 - index % (GROUPS_COUNT - 1)].push(...extraGroup);
    });

    return sortedGroups.slice(0, GROUPS_COUNT);
  }, [player.builtCards]);
}
