import { Player, Resource } from 'common/types/games/sevenWonders';
import { CardType } from 'common/types/games/sevenWonders/cards';

import getPlayerCity from 'common/utilities/games/sevenWonders/getPlayerCity';
import { isResourceEffect } from 'common/utilities/games/sevenWonders/isEffect';
import { isDefined } from 'common/utilities/is';

export default function getPlayerTradeResources(player: Player): Resource[][] {
  const builtCardsResourceVariants = player.data.builtCards
    .filter((builtCard) => builtCard.type === CardType.RAW_MATERIAL || builtCard.type === CardType.MANUFACTURED_GOODS)
    .flatMap((builtCard) => builtCard.effects.filter(isResourceEffect))
    .map((effect) => effect.variants);

  const { effects: cityEffects } = getPlayerCity(player.data);

  const cityResourceVariants = cityEffects
    .map((effect) => (isResourceEffect(effect) ? effect.variants : undefined))
    .filter(isDefined);

  return [...builtCardsResourceVariants, ...cityResourceVariants];
}
