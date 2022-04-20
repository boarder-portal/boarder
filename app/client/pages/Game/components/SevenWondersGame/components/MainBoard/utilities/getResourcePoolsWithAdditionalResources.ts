import { IOwnerResource } from 'client/pages/Game/components/SevenWondersGame/components/MainBoard/types';

import { getAllCombinations } from 'common/utilities/combinations';

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
  resourcePools: IOwnerResource[][],
  additionalResources: IOwnerResource[][],
): IOwnerResource[][] {
  const additionalResourceVariants = getAllCombinations(additionalResources);

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
