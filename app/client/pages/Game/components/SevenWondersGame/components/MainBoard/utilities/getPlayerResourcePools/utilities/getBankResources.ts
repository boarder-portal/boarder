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
import { isTradeEffect } from 'common/utilities/sevenWonders/isEffect';

export default function getBankResources(player: Player): OwnerResource[][] {
  const tradeEffects = getAllPlayerEffects(player.data).filter(isTradeEffect);

  const bankTradeResources = tradeEffects
    .map((effect): Resource[] | undefined => {
      if (!effect.sources.includes('bank')) {
        return undefined;
      }

      const resourceVariant: Resource[] = [];

      effect.resources.forEach((resourceType) => {
        if (resourceType === CardType.RAW_MATERIAL) {
          resourceVariant.push(...ANY_RAW_RESOURCE_VARIANT);
        } else if (resourceType === CardType.MANUFACTURED_GOODS) {
          resourceVariant.push(...ANY_MANUFACTURED_GOOD_RESOURCE_VARIANT);
        }
      });

      return resourceVariant;
    })
    .filter(isNotUndefined);

  return getOwnerResources(bankTradeResources, 'bank');
}
