import {
  ANY_MANUFACTURED_GOOD_RESOURCE_VARIANT,
  ANY_RAW_RESOURCE_VARIANT,
} from 'client/pages/Game/components/SevenWondersGame/constants';

import { OwnerResource } from 'client/pages/Game/components/SevenWondersGame/components/MainBoard/types';
import { Player, Resource } from 'common/types/sevenWonders';
import { CardType } from 'common/types/sevenWonders/cards';

import getOwnerResources from 'client/pages/Game/components/SevenWondersGame/components/MainBoard/utilities/getOwnerResources';
import isNotUndefined from 'common/utilities/isNotUndefined';
import getAllPlayerEffects from 'common/utilities/sevenWonders/getAllPlayerEffects';
import { isReducedPriceEffect } from 'common/utilities/sevenWonders/isEffect';

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
