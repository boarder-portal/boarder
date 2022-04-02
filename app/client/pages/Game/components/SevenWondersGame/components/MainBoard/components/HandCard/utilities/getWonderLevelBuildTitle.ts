import {
  EBuildType,
} from 'client/pages/Game/components/SevenWondersGame/components/MainBoard/components/HandCard/types';

export default function getWonderLevelBuildTitle(buildType: EBuildType): string {
  switch (buildType) {
    case EBuildType.FREE:
    case EBuildType.FOR_BUILDING:
    case EBuildType.OWN_RESOURCES:
    case EBuildType.OWN_RESOURCES_AND_COINS: {
      return 'Заложить';
    }

    case EBuildType.WITH_TRADE: {
      return 'Заложить c торговлей';
    }

    case EBuildType.ALREADY_BUILT: {
      return 'Уже построены';
    }

    default: {
      return 'Нельзя заложить';
    }
  }
}
