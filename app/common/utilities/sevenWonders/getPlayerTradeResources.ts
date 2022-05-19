import { IPlayer, IResource } from 'common/types/sevenWonders';
import { ECardType } from 'common/types/sevenWonders/cards';

import { isResourceEffect } from 'common/utilities/sevenWonders/isEffect';
import getPlayerCity from 'common/utilities/sevenWonders/getPlayerCity';
import isNotUndefined from 'common/utilities/isNotUndefined';

export default function getPlayerTradeResources(player: IPlayer): IResource[][] {
  const builtCardsResourceVariants = player.data.builtCards
    .filter((builtCard) => builtCard.type === ECardType.RAW_MATERIAL || builtCard.type === ECardType.MANUFACTURED_GOODS)
    .flatMap((builtCard) => builtCard.effects.filter(isResourceEffect))
    .map((effect) => effect.variants);

  const { effects: cityEffects } = getPlayerCity(player.data);

  const cityResourceVariants = cityEffects
    .map((effect) => (isResourceEffect(effect) ? effect.variants : undefined))
    .filter(isNotUndefined);

  return [...builtCardsResourceVariants, ...cityResourceVariants];
}
