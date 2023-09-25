import groupBy from 'lodash/groupBy';
import sortBy from 'lodash/sortBy';
import { useMemo } from 'react';

import { Player } from 'common/types/games/sevenWonders';
import { Card, CardType } from 'common/types/games/sevenWonders/cards';

const GROUPS_COUNT = 4;

export default function useCardGroups(player: Player): Card[][] {
  return useMemo(() => {
    const groupedCards = Object.entries(
      groupBy(player.data.builtCards, ({ type }) =>
        type === CardType.RAW_MATERIAL || type === CardType.MANUFACTURED_GOODS ? 'resources' : type,
      ),
    ) as [CardType | 'resources', Card[]][];

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
