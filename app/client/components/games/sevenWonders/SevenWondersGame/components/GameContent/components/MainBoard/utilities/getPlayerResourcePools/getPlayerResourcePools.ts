import { OwnerResource } from 'client/components/games/sevenWonders/SevenWondersGame/components/GameContent/components/MainBoard/types';
import { NeighborSide, Player } from 'common/types/games/sevenWonders';

import getOwnerResources from 'client/components/games/sevenWonders/SevenWondersGame/components/GameContent/components/MainBoard/utilities/getOwnerResources';
import getBankResources from 'client/components/games/sevenWonders/SevenWondersGame/components/GameContent/components/MainBoard/utilities/getPlayerResourcePools/utilities/getBankResources';
import getResourcePools from 'client/components/games/sevenWonders/SevenWondersGame/components/GameContent/components/MainBoard/utilities/getPlayerResourcePools/utilities/getResourcePools';
import { getPlayerResources } from 'client/components/games/sevenWonders/SevenWondersGame/components/GameContent/components/MainBoard/utilities/getPlayerResources';

/**
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
export default function getPlayerResourcePools(
  player: Player,
  leftNeighbor: Player,
  rightNeighbor: Player,
): OwnerResource[][] {
  const playerResources = getOwnerResources(getPlayerResources(player), 'own');
  const leftNeighborResources = getOwnerResources(getPlayerResources(leftNeighbor, true), NeighborSide.LEFT);
  const rightNeighborResources = getOwnerResources(getPlayerResources(rightNeighbor, true), NeighborSide.RIGHT);
  const bankResources = getBankResources(player);

  return getResourcePools([...playerResources, ...leftNeighborResources, ...rightNeighborResources, ...bankResources]);
}
