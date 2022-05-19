import { useMemo } from 'react';
import { groupBy } from 'lodash';
import sortBy from 'lodash/sortBy';

import { ECardType, ICard } from 'common/types/sevenWonders/cards';
import { IPlayer } from 'common/types/sevenWonders';

const GROUPS_COUNT = 4;

export default function useCardGroups(player: IPlayer): ICard[][] {
  return useMemo(() => {
    const groupedCards = Object.entries(
      groupBy(player.data.builtCards, ({ type }) =>
        type === ECardType.RAW_MATERIAL || type === ECardType.MANUFACTURED_GOODS ? 'resources' : type,
      ),
    ) as [ECardType | 'resources', ICard[]][];

    const sortedGroups = sortBy(groupedCards, ([type, group]) => {
      if (type === 'resources') {
        return -Infinity;
      }

      return -group.length;
    }).map(([, group]) => group);

    const extraGroups = sortedGroups.slice(GROUPS_COUNT).reverse();

    extraGroups.forEach((extraGroup, index) => {
      sortedGroups[3 - (index % (GROUPS_COUNT - 1))].push(...extraGroup);
    });

    return sortedGroups.slice(0, GROUPS_COUNT);
  }, [player.data.builtCards]);
}
