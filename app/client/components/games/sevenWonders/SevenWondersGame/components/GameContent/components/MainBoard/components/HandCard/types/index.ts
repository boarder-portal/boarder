import { BuildType, Payments } from 'common/types/games/sevenWonders';

import { TradeVariant } from 'client/components/games/sevenWonders/SevenWondersGame/components/GameContent/components/MainBoard/components/HandCard/utilities/getTradeVariantsByPurchaseVariants';

export enum BuildKind {
  FREE = 'FREE',
  FREE_WITH_EFFECT = 'FREE_WITH_EFFECT',
  FREE_BY_BUILDING = 'FREE_BY_BUILDING',
  FREE_BY_OWN_RESOURCES = 'FREE_BY_OWN_RESOURCES',
  OWN_RESOURCES_AND_COINS = 'OWN_RESOURCES_AND_COINS',
  WITH_TRADE = 'WITH_TRADE',
  NOT_ENOUGH_RESOURCES_OR_COINS = 'NOT_ENOUGH_RESOURCES_OR_COINS',
  ALREADY_BUILT = 'ALREADY_BUILT',
  NOT_ALLOWED = 'NOT_ALLOWED',
}

export interface BuildInfo {
  type: BuildKind;
  title: string;
  tradeVariants: TradeVariant[];
  onBuild(freeBuildType: BuildType | null, payments?: Payments): void;
}
