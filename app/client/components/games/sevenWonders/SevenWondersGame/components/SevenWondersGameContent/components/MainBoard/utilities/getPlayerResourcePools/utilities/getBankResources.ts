import {
  ANY_MANUFACTURED_GOOD_RESOURCE_VARIANT,
  ANY_RAW_RESOURCE_VARIANT,
} from 'client/components/games/sevenWonders/SevenWondersGame/components/SevenWondersGameContent/constants';

import { OwnerResource } from 'client/components/games/sevenWonders/SevenWondersGame/components/SevenWondersGameContent/components/MainBoard/types';
import { Player, Resource } from 'common/types/games/sevenWonders';
import { CardType } from 'common/types/games/sevenWonders/cards';

import getOwnerResources from 'client/components/games/sevenWonders/SevenWondersGame/components/SevenWondersGameContent/components/MainBoard/utilities/getOwnerResources';
import getAllPlayerEffects from 'common/utilities/games/sevenWonders/getAllPlayerEffects';
import { isTradeEffect } from 'common/utilities/games/sevenWonders/isEffect';
import { isDefined } from 'common/utilities/is';

export default function getBankResources(player: Player): OwnerResource[][] {
  const tradeEffects = getAllPlayerEffects(player.data).filter(isTradeEffect);

  const bankTradeResources = tradeEffects
    .map((effect): Resource[] | undefined => {
      if (!effect.sources.includes('bank')) {
        return;
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
    .filter(isDefined);

  return getOwnerResources(bankTradeResources, 'bank');
}
