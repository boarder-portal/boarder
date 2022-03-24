import times from 'lodash/times';

import { IOwnerResource } from 'client/pages/Game/components/SevenWondersGame/components/MainBoard/types';

import { getAllCombinations } from 'common/utilities/combinations';

/**
 * ownerResources [
 *    [{ type: 'WOOD', count: 1, ownerA }, { type: 'STONE', count: 1, ownerA }],
 *    [{ type: 'CLAY', count: 2, ownerA }],
 *    [{ type: 'GLASS', count: 2, ownerB }]
 *    [{ type: 'WOOD', count: 1, ownerC }, { type: 'CLAY', count: 1, ownerC }]
 * ]
 *
 * [
 *    [
 *      { type: 'WOOD', count: 1, ownerA },
 *      { type: 'CLAY', count: 1, ownerA },
 *      { type: 'CLAY', count: 1, ownerA },
 *      { type: 'GLASS', count: 1, ownerB },
 *      { type: 'GLASS', count: 1, ownerB },
 *      { type: 'WOOD', count: 1, ownerC },
 *    ],
 *    [
 *      { type: 'STONE', count: 1, ownerA },
 *      { type: 'CLAY', count: 1, ownerA },
 *      { type: 'CLAY', count: 1, ownerA },
 *      { type: 'GLASS', count: 1, ownerB },
 *      { type: 'GLASS', count: 1, ownerB },
 *      { type: 'CLAY', count: 1, ownerC },
 *    ]
 * ]
 */
export default function getResourcePools(ownerResources: IOwnerResource[][]): IOwnerResource[][] {
  return getAllCombinations(ownerResources)
    .map((resourcePool) => resourcePool
      .flatMap((resource) => times(resource.count, () => ({
        ...resource,
        count: 1,
      }))),
    );
}
