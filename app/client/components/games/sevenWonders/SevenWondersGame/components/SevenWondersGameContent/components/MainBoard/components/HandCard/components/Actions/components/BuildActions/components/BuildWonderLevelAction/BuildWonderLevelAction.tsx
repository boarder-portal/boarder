import { FC, memo, useCallback } from 'react';

import { BuildKind } from 'client/components/games/sevenWonders/SevenWondersGame/components/SevenWondersGameContent/components/MainBoard/components/HandCard/types';
import { Action, CardActionType, Payments, Player } from 'common/types/games/sevenWonders';

import { TradeVariant } from 'client/components/games/sevenWonders/SevenWondersGame/components/SevenWondersGameContent/components/MainBoard/components/HandCard/utilities/getTradeVariantsByPurchaseVariants';

import useBoolean from 'client/hooks/useBoolean';

import TradeModal from 'client/components/games/sevenWonders/SevenWondersGame/components/SevenWondersGameContent/components/MainBoard/components/HandCard/components/TradeModal/TradeModal';

interface BuildWonderLevelActionProps {
  player: Player;
  buildType: BuildKind;
  tradeVariants: TradeVariant[];
  onCardAction(action: Action, payments?: Payments): void;
}

function getTitle(buildType: BuildKind): string {
  switch (buildType) {
    case BuildKind.FREE:
    case BuildKind.FREE_BY_BUILDING:
    case BuildKind.FREE_BY_OWN_RESOURCES:
    case BuildKind.OWN_RESOURCES_AND_COINS: {
      return 'Заложить';
    }

    case BuildKind.WITH_TRADE: {
      return 'Заложить c торговлей';
    }

    case BuildKind.ALREADY_BUILT: {
      return 'Уже построены';
    }

    case BuildKind.NOT_ENOUGH_RESOURCES_OR_COINS:
    case BuildKind.NOT_ALLOWED: {
      return 'Нельзя заложить';
    }

    case BuildKind.FREE_WITH_EFFECT: {
      throw new Error('Невозможный вариант');
    }
  }
}

const BuildWonderLevelAction: FC<BuildWonderLevelActionProps> = (props) => {
  const { player, buildType, tradeVariants, onCardAction } = props;

  const { value: isTradeModalVisible, setTrue: openTradeModal, setFalse: closeTradeModal } = useBoolean(false);

  const build = useCallback(
    (payments?: Payments) => {
      onCardAction(
        {
          type: CardActionType.BUILD_WONDER_STAGE,
          stageIndex: player.data.builtStages.length,
        },
        payments,
      );
    },
    [onCardAction, player.data.builtStages.length],
  );

  const handleClick = useCallback(() => {
    if (
      buildType === BuildKind.FREE ||
      buildType === BuildKind.FREE_BY_OWN_RESOURCES ||
      buildType === BuildKind.OWN_RESOURCES_AND_COINS ||
      buildType === BuildKind.FREE_BY_BUILDING
    ) {
      build();
    } else if (buildType === BuildKind.WITH_TRADE) {
      openTradeModal();
    }
  }, [build, buildType, openTradeModal]);

  if (buildType === BuildKind.ALREADY_BUILT || buildType === BuildKind.NOT_ALLOWED) {
    return null;
  }

  return (
    <>
      <div onClick={handleClick}>{getTitle(buildType)}</div>

      <TradeModal open={isTradeModalVisible} tradeVariants={tradeVariants} onBuild={build} onClose={closeTradeModal} />
    </>
  );
};

export default memo(BuildWonderLevelAction);
