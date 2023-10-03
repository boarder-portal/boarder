import {
  ANY_MANUFACTURED_GOOD_RESOURCE_VARIANT,
  ANY_RAW_RESOURCE_VARIANT,
} from 'client/components/games/sevenWonders/SevenWondersGame/components/SevenWondersGameContent/constants';

import { OwnerResource } from 'client/components/games/sevenWonders/SevenWondersGame/components/SevenWondersGameContent/components/MainBoard/types';
import { Player, Resource } from 'common/types/games/sevenWonders';
import { CardType } from 'common/types/games/sevenWonders/cards';

import getOwnerResources from 'client/components/games/sevenWonders/SevenWondersGame/components/SevenWondersGameContent/components/MainBoard/utilities/getOwnerResources';
import getAllPlayerEffects from 'common/utilities/games/sevenWonders/getAllPlayerEffects';
import { isReducedPriceEffect } from 'common/utilities/games/sevenWonders/isEffect';
import { isDefined } from 'common/utilities/is';

export default function getObjectSpecificResources(
  player: Player,
  objectType: CardType | 'wonderLevel',
): OwnerResource[][] {
  const reducedPriceEffects = getAllPlayerEffects(player.data).filter(isReducedPriceEffect);

  const reducesPriceResources = reducedPriceEffects
    .map((effect): Resource[] | undefined => {
      if (effect.objectType !== objectType || !effect.discount.resources) {
        return;
      }

      return [...ANY_RAW_RESOURCE_VARIANT, ...ANY_MANUFACTURED_GOOD_RESOURCE_VARIANT];
    })
    .filter(isDefined);

  return getOwnerResources(reducesPriceResources, 'own');
}
