import { OwnerResource } from 'client/components/games/sevenWonders/SevenWondersGame/components/GameContent/components/MainBoard/types';

import { getSetsCombinations } from 'common/utilities/combinations';

/**
 * resourcePools [
 *    [
 *      { type: 'WOOD', count: 1, ownerA },
 *      { type: 'CLAY', count: 1, ownerA },
 *      { type: 'CLAY', count: 1, ownerA },
 *    ],
 *    [
 *      { type: 'STONE', count: 1, ownerA },
 *      { type: 'CLAY', count: 1, ownerA },
 *      { type: 'GLASS', count: 1, ownerB },
 *    ]
 * ]
 *
 * additionalResources [
 *    [
 *      { type: 'WOOD', count: 1, ownerC },
 *      { type: 'STONE', count: 1, ownerC },
 *    ],
 *    [
 *      { type: 'CLAY', count: 1, ownerC },
 *      { type: 'ORE', count: 1, ownerC },
 *    ]
 * ]
 *
 *  result [
 *    [
 *      { type: 'WOOD', count: 1, ownerA },
 *      { type: 'CLAY', count: 1, ownerA },
 *      { type: 'CLAY', count: 1, ownerA },
 *
 *      { type: 'WOOD', count: 1, ownerC },
 *      { type: 'CLAY', count: 1, ownerC },
 *    ],
 *    [
 *      { type: 'STONE', count: 1, ownerA },
 *      { type: 'CLAY', count: 1, ownerA },
 *      { type: 'GLASS', count: 1, ownerB },
 *
 *      { type: 'WOOD', count: 1, ownerC },
 *      { type: 'ORE', count: 1, ownerC },
 *    ],
 *    [
 *      { type: 'WOOD', count: 1, ownerA },
 *      { type: 'CLAY', count: 1, ownerA },
 *      { type: 'CLAY', count: 1, ownerA },
 *
 *      { type: 'STONE', count: 1, ownerC },
 *      { type: 'CLAY', count: 1, ownerC },
 *    ],
 *    [
 *      { type: 'STONE', count: 1, ownerA },
 *      { type: 'CLAY', count: 1, ownerA },
 *      { type: 'GLASS', count: 1, ownerB },
 *
 *      { type: 'STONE', count: 1, ownerC },
 *      { type: 'ORE', count: 1, ownerC },
 *    ]
 * ]
 */
export default function getResourcePoolsWithAdditionalResources(
  resourcePools: OwnerResource[][],
  additionalResources: OwnerResource[][],
): OwnerResource[][] {
  const additionalResourceVariants = getSetsCombinations(additionalResources);

  return resourcePools.flatMap((resourcePool) => {
    if (!additionalResourceVariants.length) {
      return [resourcePool];
    }

    return additionalResourceVariants.map((additionalResourceVariant) => [
      ...resourcePool,
      ...additionalResourceVariant,
    ]);
  });
}
