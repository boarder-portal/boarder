import { ENeighborSide, IPlayer } from 'common/types/sevenWonders';
import { IOwnerResource } from 'client/pages/Game/components/SevenWondersGame/components/MainBoard/types';
import { ECardType } from 'common/types/sevenWonders/cards';

import getOwnerResources
  from 'client/pages/Game/components/SevenWondersGame/components/MainBoard/utilities/getOwnerResources';
import {
  getPlayerResources,
} from 'client/pages/Game/components/SevenWondersGame/components/MainBoard/utilities/getPlayerResources';
import getResourcePools
  from 'client/pages/Game/components/SevenWondersGame/components/MainBoard/utilities/getPlayerResourcePools/utilities/getResourcePools';
import getBankResources
  from 'client/pages/Game/components/SevenWondersGame/components/MainBoard/utilities/getPlayerResourcePools/utilities/getBankResources';
import getObjectSpecificResources from 'client/pages/Game/components/SevenWondersGame/components/MainBoard/utilities/getPlayerResourcePools/utilities/getObjectSpecificResources';

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
  player: IPlayer,
  leftNeighbor: IPlayer,
  rightNeighbor: IPlayer,
  objectType: ECardType | 'wonderLevel',
): IOwnerResource[][]  {
  const playerResources = getOwnerResources(getPlayerResources(player), 'own');
  const leftNeighborResources = getOwnerResources(getPlayerResources(leftNeighbor, true), ENeighborSide.LEFT);
  const rightNeighborResources = getOwnerResources(getPlayerResources(rightNeighbor, true), ENeighborSide.RIGHT);
  const bankResources = getBankResources(player);
  const objectSpecificResources = getObjectSpecificResources(player, objectType);

  return getResourcePools([
    ...playerResources,
    ...leftNeighborResources,
    ...rightNeighborResources,
    ...bankResources,
    ...objectSpecificResources,
  ]);
}
