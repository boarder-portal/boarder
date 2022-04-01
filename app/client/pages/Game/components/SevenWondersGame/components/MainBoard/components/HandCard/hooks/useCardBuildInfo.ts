import { useMemo } from 'react';

import { ISevenWondersPlayer } from 'common/types/sevenWonders';
import { IOwnerResource } from 'client/pages/Game/components/SevenWondersGame/components/MainBoard/types';
import {
  IBuildInfo,
} from 'client/pages/Game/components/SevenWondersGame/components/MainBoard/components/HandCard/types';
import { ISevenWondersCard } from 'common/types/sevenWonders/cards';

import getTradeVariants
  from 'client/pages/Game/components/SevenWondersGame/components/MainBoard/utilities/getTradeVariants';
import {
  TResourceTradePrices,
} from 'client/pages/Game/components/SevenWondersGame/components/MainBoard/utilities/getResourceTradePrices';
import getCardBuildType
  from 'client/pages/Game/components/SevenWondersGame/components/MainBoard/components/HandCard/utilities/getCardBuildType';

export default function useCardBuildInfo(
  card: ISevenWondersCard,
  resourcePools: IOwnerResource[][],
  resourceTradePrices: TResourceTradePrices,
  player: ISevenWondersPlayer,
): IBuildInfo {
  const { price: cardPrice } = card;

  const tradeVariants = useMemo(() => getTradeVariants(cardPrice, resourcePools, resourceTradePrices), [cardPrice, resourcePools, resourceTradePrices]);
  const type = useMemo(() => getCardBuildType(card, player, tradeVariants), [card, player, tradeVariants]);

  return useMemo(() => ({
    type,
    tradeVariants,
  }), [tradeVariants, type]);
}
