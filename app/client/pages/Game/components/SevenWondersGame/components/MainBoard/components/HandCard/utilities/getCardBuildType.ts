import { ICard } from 'common/types/sevenWonders/cards';
import { ECardActionType, IPlayer } from 'common/types/sevenWonders';
import { EBuildType } from 'client/pages/Game/components/SevenWondersGame/components/MainBoard/components/HandCard/types';

import { ITradeVariant } from 'client/pages/Game/components/SevenWondersGame/components/MainBoard/components/HandCard/utilities/getTradeVariantsByPurchaseVariants';
import getBuildType from 'client/pages/Game/components/SevenWondersGame/components/MainBoard/components/HandCard/utilities/getBuildType';
import getPossibleBuildActions from 'common/utilities/sevenWonders/getPossibleBuildActions';

export default function getCardBuildType(
  card: ICard,
  player: IPlayer,
  tradeVariants: ITradeVariant[],
  discount: number,
): EBuildType {
  const possibleBuildActions = getPossibleBuildActions(player);

  if (!possibleBuildActions.includes(ECardActionType.BUILD_STRUCTURE)) {
    return EBuildType.NOT_ALLOWED;
  }

  if (player.data.builtCards.some((builtCard) => builtCard.id === card.id)) {
    return EBuildType.ALREADY_BUILT;
  }

  const { price } = card;

  if (!price) {
    return EBuildType.FREE;
  }

  if (price.buildings && player.data.builtCards.some((builtCard) => price.buildings?.includes(builtCard.id))) {
    return EBuildType.FREE_BY_BUILDING;
  }

  return getBuildType(price, player, tradeVariants, discount);
}
