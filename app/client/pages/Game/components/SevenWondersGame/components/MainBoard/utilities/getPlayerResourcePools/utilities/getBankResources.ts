import {
  ANY_MANUFACTURED_GOOD_RESOURCE_VARIANT,
  ANY_RAW_RESOURCE_VARIANT,
} from 'client/pages/Game/components/SevenWondersGame/constants';

import { IPlayer, IResource } from 'common/types/sevenWonders';
import { IOwnerResource } from 'client/pages/Game/components/SevenWondersGame/components/MainBoard/types';
import { ECardType } from 'common/types/sevenWonders/cards';

import getAllPlayerEffects from 'common/utilities/sevenWonders/getAllPlayerEffects';
import { isTradeEffect } from 'common/utilities/sevenWonders/isEffect';
import isNotUndefined from 'common/utilities/isNotUndefined';
import getOwnerResources
  from 'client/pages/Game/components/SevenWondersGame/components/MainBoard/utilities/getOwnerResources';

export default function getBankResources(player: IPlayer): IOwnerResource[][] {
  const tradeEffects = getAllPlayerEffects(player).filter(isTradeEffect);

  const bankTradeResources = tradeEffects.map((effect): IResource[] | undefined => {
    if (!effect.sources.includes('bank')) {
      return undefined;
    }

    const resourceVariant: IResource[] = [];

    effect.resources.forEach((resourceType) => {
      if (resourceType === ECardType.RAW_MATERIAL) {
        resourceVariant.push(...ANY_RAW_RESOURCE_VARIANT);
      } else if (resourceType === ECardType.MANUFACTURED_GOODS) {
        resourceVariant.push(...ANY_MANUFACTURED_GOOD_RESOURCE_VARIANT);
      }
    });

    return resourceVariant;
  }).filter(isNotUndefined);

  return getOwnerResources(bankTradeResources, 'bank');
}
