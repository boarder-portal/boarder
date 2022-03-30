import { ISevenWondersPlayer, ISevenWondersResource } from 'common/types/sevenWonders';
import { ESevenWondersCardType } from 'common/types/sevenWonders/cards';

import { isResourceEffect } from 'common/utilities/sevenWonders/isEffect';
import getCity from 'common/utilities/sevenWonders/getCity';

export default function getPlayerTradeResources(player: ISevenWondersPlayer): ISevenWondersResource[][] {
  const builtCardsResourceVariants = player.builtCards
    .filter((builtCard) => builtCard.type === ESevenWondersCardType.RAW_MATERIAL || builtCard.type === ESevenWondersCardType.MANUFACTURED_GOODS)
    .flatMap((builtCard) => builtCard.effects.filter(isResourceEffect))
    .map((effect) => effect.variants);

  const { effect: cityEffect } = getCity(player.city, player.citySide);

  const cityResourceVariants = isResourceEffect(cityEffect) ? cityEffect.variants : [];

  return [...builtCardsResourceVariants, cityResourceVariants];
}
