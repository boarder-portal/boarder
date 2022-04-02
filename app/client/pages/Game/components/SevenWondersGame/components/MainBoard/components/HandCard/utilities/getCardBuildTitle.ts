import {
  EBuildType,
} from 'client/pages/Game/components/SevenWondersGame/components/MainBoard/components/HandCard/types';

export default function getCardBuildTitle(buildType: EBuildType): string {
  switch (buildType) {
    case EBuildType.FREE:
    case EBuildType.FOR_BUILDING:
    case EBuildType.OWN_RESOURCES:
    case EBuildType.OWN_RESOURCES_AND_COINS: {
      return 'Построить';
    }

    case EBuildType.WITH_TRADE: {
      return 'Построить c торговлей';
    }

    default: {
      return 'Нельзя построить';
    }
  }
}
