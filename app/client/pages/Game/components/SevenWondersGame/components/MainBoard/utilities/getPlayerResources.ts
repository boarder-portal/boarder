import { ISevenWondersPlayer, ISevenWondersResource } from 'common/types/sevenWonders';

import { isResourceEffect } from 'common/utilities/sevenWonders/isEffect';
import getAllPlayerEffects from 'common/utilities/sevenWonders/getAllPlayerEffects';
import getPlayerTradeResources from 'common/utilities/sevenWonders/getPlayerTradeResources';

/**
 * Если есть карточка WOOD / STONE, CLAY * 2 и ресурс города - GLASS
 *
 * [
 *    [{ type: 'WOOD', count: 1 }, { type: 'STONE', count: 1 }],
 *    [{ type: 'CLAY', count: 2 }],
 *    [{ type: 'GLASS', count: 1 }],
 * ]
 */
export function getPlayerResources(player: ISevenWondersPlayer, onlyTradableResources?: boolean): ISevenWondersResource[][]  {
  return onlyTradableResources ?
    getPlayerTradeResources(player) :
    getAllPlayerEffects(player)
      .filter(isResourceEffect)
      .map((resourceEffect) => resourceEffect.variants);
}
