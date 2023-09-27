import { BuildKind } from 'client/components/games/sevenWonders/SevenWondersGame/components/SevenWondersGameContent/components/MainBoard/components/HandCard/types';
import { CardActionType, Player } from 'common/types/games/sevenWonders';
import { Card } from 'common/types/games/sevenWonders/cards';

import getBuildType from 'client/components/games/sevenWonders/SevenWondersGame/components/SevenWondersGameContent/components/MainBoard/components/HandCard/utilities/getBuildType';
import { TradeVariant } from 'client/components/games/sevenWonders/SevenWondersGame/components/SevenWondersGameContent/components/MainBoard/components/HandCard/utilities/getTradeVariantsByPurchaseVariants';
import getPossibleBuildActions from 'common/utilities/games/sevenWonders/getPossibleBuildActions';

export default function getCardBuildType(
  card: Card,
  player: Player,
  tradeVariants: TradeVariant[],
  discount: number,
): BuildKind {
  const possibleBuildActions = getPossibleBuildActions(player);

  if (!possibleBuildActions.includes(CardActionType.BUILD_STRUCTURE)) {
    return BuildKind.NOT_ALLOWED;
  }

  if (player.data.builtCards.some((builtCard) => builtCard.id === card.id)) {
    return BuildKind.ALREADY_BUILT;
  }

  const { price } = card;

  if (!price) {
    return BuildKind.FREE;
  }

  if (price.buildings && player.data.builtCards.some((builtCard) => price.buildings?.includes(builtCard.id))) {
    return BuildKind.FREE_BY_BUILDING;
  }

  return getBuildType(price, player, tradeVariants, discount);
}
