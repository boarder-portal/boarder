import { Player, Resource } from 'common/types/sevenWonders';
import { CardType } from 'common/types/sevenWonders/cards';

import isNotUndefined from 'common/utilities/isNotUndefined';
import getPlayerCity from 'common/utilities/sevenWonders/getPlayerCity';
import { isResourceEffect } from 'common/utilities/sevenWonders/isEffect';

export default function getPlayerTradeResources(player: Player): Resource[][] {
  const builtCardsResourceVariants = player.data.builtCards
    .filter((builtCard) => builtCard.type === CardType.RAW_MATERIAL || builtCard.type === CardType.MANUFACTURED_GOODS)
    .flatMap((builtCard) => builtCard.effects.filter(isResourceEffect))
    .map((effect) => effect.variants);

  const { effects: cityEffects } = getPlayerCity(player.data);

  const cityResourceVariants = cityEffects
    .map((effect) => (isResourceEffect(effect) ? effect.variants : undefined))
    .filter(isNotUndefined);

  return [...builtCardsResourceVariants, ...cityResourceVariants];
}
