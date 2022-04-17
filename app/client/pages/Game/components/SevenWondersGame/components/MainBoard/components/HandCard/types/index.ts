import { TSevenWondersBuildType, TSevenWondersPayments } from 'common/types/sevenWonders';

import {
  ITradeVariant,
} from 'client/pages/Game/components/SevenWondersGame/components/MainBoard/components/HandCard/utilities/getTradeVariantsByPurchaseVariants';

export enum EBuildType {
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

export interface IBuildInfo {
  type: EBuildType;
  title: string;
  tradeVariants: ITradeVariant[];
  onBuild(freeBuildType: TSevenWondersBuildType | null, payments?: TSevenWondersPayments): void;
}
