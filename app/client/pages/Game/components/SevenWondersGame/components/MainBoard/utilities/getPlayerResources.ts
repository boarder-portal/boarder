import { ISevenWondersPlayer, ISevenWondersResource } from 'common/types/sevenWonders';
import { ESevenWondersCardType } from 'common/types/sevenWonders/cards';

import getCity from 'common/utilities/sevenWonders/getCity';
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
export function getPlayerResources(player: ISevenWondersPlayer, onlyTradableResources?: boolean): ISevenWondersResource[][]  {
  const builtCardsResourceVariants = player.builtCards
    .filter((builtCard) => onlyTradableResources ?
      builtCard.type === ESevenWondersCardType.RAW_MATERIAL || builtCard.type === ESevenWondersCardType.MANUFACTURED_GOODS :
      true,
    )
    .flatMap((builtCard) => builtCard.effects.filter(isResourceEffect))
    .map((effect) => effect.variants);

  const { effect: cityEffect } = getCity(player.city, player.citySide);

  const cityResourceVariants = isResourceEffect(cityEffect) ? cityEffect.variants : [];

  return [...builtCardsResourceVariants, cityResourceVariants];
}
