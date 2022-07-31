import groupBy from 'lodash/groupBy';

import { IOwnerResource } from 'client/pages/Game/components/SevenWondersGame/components/MainBoard/types';
import { IPrice } from 'common/types/sevenWonders';

import getUniqCombinationsByN from 'common/utilities/getUniqCombinationsByN';
import { getSetsCombinations } from 'common/utilities/combinations';

/**
 * price: {
 *   resource: [{ type: 'WOOD', count: 1 }, { type: 'CLAY', count: 2 }]
 * }
 *
 * resourcePools [
 *    [
 *      { type: 'WOOD', count: 1, ownerA },
 *      { type: 'CLAY', count: 1, ownerA },
 *      { type: 'CLAY', count: 1, ownerA },
 *      { type: 'GLASS', count: 1, ownerB },
 *      { type: 'GLASS', count: 1, ownerB },
 *      { type: 'WOOD', count: 1, ownerC },
 *    ],
 *    [
 *      { type: 'WOOD', count: 1, ownerA },
 *      { type: 'CLAY', count: 1, ownerA },
 *      { type: 'CLAY', count: 1, ownerA },
 *      { type: 'GLASS', count: 1, ownerB },
 *      { type: 'GLASS', count: 1, ownerB },
 *      { type: 'CLAY', count: 1, ownerC },
 *    ]
 * ]
 *
 * [
 *    [{ type: 'WOOD', count: 1, ownerA }, { type: 'CLAY', count: 1, ownerA }, { type: 'CLAY', count: 1, ownerA }],
 *    [{ type: 'WOOD', count: 1, ownerC }, { type: 'CLAY', count: 1, ownerA }, { type: 'CLAY', count: 1, ownerA }],
 *
 *    [{ type: 'WOOD', count: 1, ownerA }, { type: 'CLAY', count: 1, ownerA }, { type: 'CLAY', count: 1, ownerA }],
 *    [{ type: 'WOOD', count: 1, ownerA }, { type: 'CLAY', count: 1, ownerA }, { type: 'CLAY', count: 1, ownerC }]
 *    [{ type: 'WOOD', count: 1, ownerA }, { type: 'CLAY', count: 1, ownerA }, { type: 'CLAY', count: 1, ownerC }]
 * ]
 */
export default function getPurchaseVariants(
  price: IPrice | undefined,
  resourcePools: IOwnerResource[][],
): IOwnerResource[][] {
  const cardResourcePrice = price?.resources;

  if (!cardResourcePrice) {
    return [];
  }

  return resourcePools.flatMap((resourcePool) => {
    /**
     * Для второго пула
     * {
     *   WOOD: [{ type: 'WOOD', count: 1, ownerA }],
     *   CLAY: [{ type: 'CLAY', count: 1, ownerA }, { type: 'CLAY', count: 1, ownerA }, { type: 'CLAY', count: 1, ownerC }],
     *   GLASS: [{ type: 'GLASS', count: 1, ownerB }, { type: 'GLASS', count: 1, ownerB }],
     * }
     */
    const resourceGroups = groupBy(resourcePool, (resource) => resource.type);

    /**
     * [
     *  [
     *    [{ type: 'WOOD', count: 1, ownerA }]
     *  ],
     *  [
     *    [{ type: 'CLAY', count: 1, ownerA }, { type: 'CLAY', count: 1, ownerA }],
     *    [{ type: 'CLAY', count: 1, ownerA }, { type: 'CLAY', count: 1, ownerC }],
     *    [{ type: 'CLAY', count: 1, ownerA }, { type: 'CLAY', count: 1, ownerC }],
     *  ],
     * ]
     *
     */
    const resourceVariants: IOwnerResource[][][] = [];

    for (const cardResource of cardResourcePrice) {
      const resourceGroup = resourceGroups[cardResource.type];

      if (!resourceGroup || resourceGroup.length < cardResource.count) {
        return [];
      }

      /**
       * [
       *    [{ type: 'CLAY', count: 1, ownerA }, { type: 'CLAY', count: 1, ownerA }],
       *    [{ type: 'CLAY', count: 1, ownerA }, { type: 'CLAY', count: 1, ownerC }],
       *    [{ type: 'CLAY', count: 1, ownerA }, { type: 'CLAY', count: 1, ownerC }],
       * ]
       */
      const resourcePurchaseVariants = getUniqCombinationsByN(resourceGroup, cardResource.count);

      resourceVariants.push(resourcePurchaseVariants);
    }

    /**
     * [
     *  [
     *    [{ type: 'WOOD', count: 1, ownerA }],
     *    [{ type: 'CLAY', count: 1, ownerA }, { type: 'CLAY', count: 1, ownerA }]
     *  ],
     *  [
     *    [{ type: 'WOOD', count: 1, ownerA }],
     *    [{ type: 'CLAY', count: 1, ownerA }, { type: 'CLAY', count: 1, ownerC }]
     *  ],
     *  [
     *    [{ type: 'WOOD', count: 1, ownerA }],
     *    [{ type: 'CLAY', count: 1, ownerA }, { type: 'CLAY', count: 1, ownerC }]
     *  ]
     * ]
     *
     */
    const allResourcePurchaseVariants = getSetsCombinations(resourceVariants);

    return allResourcePurchaseVariants.map((allResourcePurchaseVariant) => allResourcePurchaseVariant.flat());
  });
}
