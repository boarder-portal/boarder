import { ISevenWondersPlayer, ISevenWondersResource } from 'common/types/sevenWonders';
import { ESevenWondersCardType } from 'common/types/sevenWonders/cards';

import { isResourceEffect } from 'common/utilities/sevenWonders/isEffect';
import getCity from 'common/utilities/sevenWonders/getCity';
import isNotUndefined from 'common/utilities/isNotUndefined';

export default function getPlayerTradeResources(player: ISevenWondersPlayer): ISevenWondersResource[][] {
  const builtCardsResourceVariants = player.builtCards
    .filter((builtCard) => builtCard.type === ESevenWondersCardType.RAW_MATERIAL || builtCard.type === ESevenWondersCardType.MANUFACTURED_GOODS)
    .flatMap((builtCard) => builtCard.effects.filter(isResourceEffect))
    .map((effect) => effect.variants);

  const { effects: cityEffects } = getCity(player.city, player.citySide);

  const cityResourceVariants = cityEffects
    .map((effect) => isResourceEffect(effect) ? effect.variants : undefined)
    .filter(isNotUndefined);

  return [...builtCardsResourceVariants, ...cityResourceVariants];
}
