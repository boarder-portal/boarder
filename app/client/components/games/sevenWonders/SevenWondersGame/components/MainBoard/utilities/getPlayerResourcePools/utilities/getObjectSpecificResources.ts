import {
  ANY_MANUFACTURED_GOOD_RESOURCE_VARIANT,
  ANY_RAW_RESOURCE_VARIANT,
} from 'client/components/games/sevenWonders/SevenWondersGame/constants';

import { OwnerResource } from 'client/components/games/sevenWonders/SevenWondersGame/components/MainBoard/types';
import { Player, Resource } from 'common/types/games/sevenWonders';
import { CardType } from 'common/types/games/sevenWonders/cards';

import getOwnerResources from 'client/components/games/sevenWonders/SevenWondersGame/components/MainBoard/utilities/getOwnerResources';
import getAllPlayerEffects from 'common/utilities/games/sevenWonders/getAllPlayerEffects';
import { isReducedPriceEffect } from 'common/utilities/games/sevenWonders/isEffect';
import isNotUndefined from 'common/utilities/isNotUndefined';

export default function getObjectSpecificResources(
  player: Player,
  objectType: CardType | 'wonderLevel',
): OwnerResource[][] {
  const reducedPriceEffects = getAllPlayerEffects(player.data).filter(isReducedPriceEffect);

  const reducesPriceResources = reducedPriceEffects
    .map((effect): Resource[] | undefined => {
      if (effect.objectType !== objectType || !effect.discount.resources) {
        return undefined;
      }

      return [...ANY_RAW_RESOURCE_VARIANT, ...ANY_MANUFACTURED_GOOD_RESOURCE_VARIANT];
    })
    .filter(isNotUndefined);

  return getOwnerResources(reducesPriceResources, 'own');
}
