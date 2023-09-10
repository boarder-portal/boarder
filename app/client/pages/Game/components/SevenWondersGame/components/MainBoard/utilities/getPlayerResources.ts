import { Player, Resource } from 'common/types/games/sevenWonders';

import getAllPlayerEffects from 'common/utilities/sevenWonders/getAllPlayerEffects';
import getPlayerTradeResources from 'common/utilities/sevenWonders/getPlayerTradeResources';
import { isResourceEffect } from 'common/utilities/sevenWonders/isEffect';

/**
 * Если есть карточка WOOD / STONE, CLAY * 2 и ресурс города - GLASS
 *
 * [
 *    [{ type: 'WOOD', count: 1 }, { type: 'STONE', count: 1 }],
 *    [{ type: 'CLAY', count: 2 }],
 *    [{ type: 'GLASS', count: 1 }],
 * ]
 */
export function getPlayerResources(player: Player, onlyTradableResources?: boolean): Resource[][] {
  return onlyTradableResources
    ? getPlayerTradeResources(player)
    : getAllPlayerEffects(player.data)
        .filter(isResourceEffect)
        .map((resourceEffect) => resourceEffect.variants);
}
