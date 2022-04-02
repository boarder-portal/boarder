import {
  ITradeVariant,
} from 'client/pages/Game/components/SevenWondersGame/components/MainBoard/components/HandCard/utilities/getTradeVariantsByPurchaseVariants';

export enum EBuildType {
  FREE = 'FREE',
  FREE_WITH_EFFECT = 'FREE_WITH_EFFECT',
  FOR_BUILDING = 'FOR_BUILDING',
  OWN_RESOURCES = 'OWN_RESOURCES',
  OWN_RESOURCES_AND_COINS = 'OWN_RESOURCES_AND_COINS',
  WITH_TRADE = 'WITH_TRADE',
  NOT_AVAILABLE = 'NOT_AVAILABLE',
  ALREADY_BUILT = 'ALREADY_BUILT',
}

export interface IBuildInfo {
  type: EBuildType;
  tradeVariants: ITradeVariant[];
}
