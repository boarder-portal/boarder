import { IPlayer, IResource } from 'common/types/sevenWonders';
import { ECardType } from 'common/types/sevenWonders/cards';

import { isResourceEffect } from 'common/utilities/sevenWonders/isEffect';
import getCity from 'common/utilities/sevenWonders/getCity';
import isNotUndefined from 'common/utilities/isNotUndefined';

export default function getPlayerTradeResources(player: IPlayer): IResource[][] {
  const builtCardsResourceVariants = player.builtCards
    .filter((builtCard) => builtCard.type === ECardType.RAW_MATERIAL || builtCard.type === ECardType.MANUFACTURED_GOODS)
    .flatMap((builtCard) => builtCard.effects.filter(isResourceEffect))
    .map((effect) => effect.variants);

  const { effects: cityEffects } = getCity(player.city, player.citySide);

  const cityResourceVariants = cityEffects
    .map((effect) => isResourceEffect(effect) ? effect.variants : undefined)
    .filter(isNotUndefined);

  return [...builtCardsResourceVariants, ...cityResourceVariants];
}
