import React, { useCallback } from 'react';

import {
  EBuildType,
} from 'client/pages/Game/components/SevenWondersGame/components/MainBoard/components/HandCard/types';
import {
  ECardActionType,
  IPlayer,
  TAction,
  TPayments,
} from 'common/types/sevenWonders';

import {
  ITradeVariant,
} from 'client/pages/Game/components/SevenWondersGame/components/MainBoard/components/HandCard/utilities/getTradeVariantsByPurchaseVariants';

import TradeModal
  from 'client/pages/Game/components/SevenWondersGame/components/MainBoard/components/HandCard/components/TradeModal/TradeModal';
import Box from 'client/components/common/Box/Box';

import { useBoolean } from 'client/hooks/useBoolean';

interface IBuildWonderLevelActionProps {
  player: IPlayer;
  buildType: EBuildType;
  tradeVariants: ITradeVariant[];
  onCardAction(action: TAction, payments?: TPayments): void;
}

function getTitle(buildType: EBuildType): string {
  switch (buildType) {
    case EBuildType.FREE:
    case EBuildType.FREE_BY_BUILDING:
    case EBuildType.FREE_BY_OWN_RESOURCES:
    case EBuildType.OWN_RESOURCES_AND_COINS: {
      return 'Заложить';
    }

    case EBuildType.WITH_TRADE: {
      return 'Заложить c торговлей';
    }

    case EBuildType.ALREADY_BUILT: {
      return 'Уже построены';
    }

    case EBuildType.NOT_ENOUGH_RESOURCES_OR_COINS:
    case EBuildType.NOT_ALLOWED: {
      return 'Нельзя заложить';
    }

    case EBuildType.FREE_WITH_EFFECT: {
      throw new Error('Невозможный вариант');
    }
  }
}

const BuildWonderLevelAction: React.FC<IBuildWonderLevelActionProps> = (props) => {
  const {
    player,
    buildType,
    tradeVariants,
    onCardAction,
  } = props;

  const {
    value: isTradeModalVisible,
    setTrue: openTradeModal,
    setFalse: closeTradeModal,
  } = useBoolean(false);

  const build = useCallback((payments?: TPayments) => {
    onCardAction({
      type: ECardActionType.BUILD_WONDER_STAGE,
      stageIndex: player.builtStages.length,
    }, payments);
  }, [onCardAction, player.builtStages.length]);

  const handleClick = useCallback(() => {
    if (
      buildType === EBuildType.FREE ||
      buildType === EBuildType.FREE_BY_OWN_RESOURCES ||
      buildType === EBuildType.OWN_RESOURCES_AND_COINS ||
      buildType === EBuildType.FREE_BY_BUILDING
    ) {
      build();
    } else if (buildType === EBuildType.WITH_TRADE) {
      openTradeModal();
    }
  }, [build, buildType, openTradeModal]);

  if (buildType === EBuildType.ALREADY_BUILT || buildType === EBuildType.NOT_ALLOWED) {
    return null;
  }

  return (
    <>
      <Box onClick={handleClick}>
        {getTitle(buildType)}
      </Box>

      <TradeModal
        isVisible={isTradeModalVisible}
        tradeVariants={tradeVariants}
        onBuild={build}
        onClose={closeTradeModal}
      />
    </>
  );
};

export default React.memo(BuildWonderLevelAction);
