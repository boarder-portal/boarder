import {
  ANY_MANUFACTURED_GOOD_RESOURCE_VARIANT,
  ANY_RAW_RESOURCE_VARIANT,
} from 'client/pages/Game/components/SevenWondersGame/constants';

import { ISevenWondersPlayer, ISevenWondersResource } from 'common/types/sevenWonders';
import { ESevenWondersCardType } from 'common/types/sevenWonders/cards';
import { IOwnerResource } from 'client/pages/Game/components/SevenWondersGame/components/MainBoard/types';

import getAllPlayerEffects from 'common/utilities/sevenWonders/getAllPlayerEffects';
import { isReducedPriceEffect } from 'common/utilities/sevenWonders/isEffect';
import isNotUndefined from 'common/utilities/isNotUndefined';
import getOwnerResources
  from 'client/pages/Game/components/SevenWondersGame/components/MainBoard/utilities/getOwnerResources';

export default function getObjectSpecificResources(
  player: ISevenWondersPlayer,
  objectType: ESevenWondersCardType | 'wonderLevel',
): IOwnerResource[][] {
  const reducedPriceEffects = getAllPlayerEffects(player).filter(isReducedPriceEffect);

  const reducesPriceResources = reducedPriceEffects.map((effect): ISevenWondersResource[] | undefined => {
    if (effect.objectType !== objectType) {
      return undefined;
    }

    return [...ANY_RAW_RESOURCE_VARIANT, ...ANY_MANUFACTURED_GOOD_RESOURCE_VARIANT];
  }).filter(isNotUndefined);

  return getOwnerResources(reducesPriceResources, 'own');
}
