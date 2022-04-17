import React, { useCallback, useMemo } from 'react';
import styled from 'styled-components';
import block from 'bem-cn';

import {
  EBuildType,
} from 'client/pages/Game/components/SevenWondersGame/components/MainBoard/components/HandCard/types';
import {
  ESevenWondersCardActionType,
  ISevenWondersPlayer,
  TSevenWondersAction,
  TSevenWondersPayments,
} from 'common/types/sevenWonders';

import getPlayerResourcePools
  from 'client/pages/Game/components/SevenWondersGame/components/MainBoard/utilities/getPlayerResourcePools/getPlayerResourcePools';
import getCity from 'common/utilities/sevenWonders/getCity';
import {
  TResourceTradePrices,
} from 'client/pages/Game/components/SevenWondersGame/components/MainBoard/utilities/getResourceTradePrices';
import getTradeVariants
  from 'client/pages/Game/components/SevenWondersGame/components/MainBoard/utilities/getTradeVariants';
import getPossibleBuildActions from 'common/utilities/sevenWonders/getPossibleBuildActions';
import getBuildType
  from 'client/pages/Game/components/SevenWondersGame/components/MainBoard/components/HandCard/utilities/getBuildType';

import TradeModal
  from 'client/pages/Game/components/SevenWondersGame/components/MainBoard/components/HandCard/components/TradeModal/TradeModal';
import Box from 'client/components/common/Box/Box';

import { useBoolean } from 'client/hooks/useBoolean';

interface IBuildWonderLevelActionProps {
  player: ISevenWondersPlayer;
  leftNeighbor: ISevenWondersPlayer;
  rightNeighbor: ISevenWondersPlayer;
  resourceTradePrices: TResourceTradePrices;
  onCardAction(action: TSevenWondersAction, payments?: TSevenWondersPayments): void;
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

const b = block('BuildWonderLevelAction');

const Root = styled(Box)`
  .BuildWonderLevelAction {

  }
`;

const BuildWonderLevelAction: React.FC<IBuildWonderLevelActionProps> = (props) => {
  const {
    player,
    leftNeighbor,
    rightNeighbor,
    resourceTradePrices,
    onCardAction,
  } = props;

  const {
    value: isTradeModalVisible,
    setTrue: openTradeModal,
    setFalse: closeTradeModal,
  } = useBoolean(false);

  const city = useMemo(() => getCity(player.city, player.citySide), [player.city, player.citySide]);

  const wonderLevelResourcePools = useMemo(() => getPlayerResourcePools(player, leftNeighbor, rightNeighbor, 'wonderLevel'), [leftNeighbor, player, rightNeighbor]);
  const wonderLevelPrice = useMemo(() => city.wonders[player.builtStages.length]?.price || null, [city.wonders, player.builtStages.length]);

  const availableTradeVariants = useMemo(() =>
    getTradeVariants(wonderLevelPrice, wonderLevelResourcePools, resourceTradePrices)
      .filter(({ payments }) => payments.LEFT + payments.RIGHT <= player.coins),
  [player.coins, resourceTradePrices, wonderLevelPrice, wonderLevelResourcePools]);

  const buildType = useMemo(() => {
    if (player.builtStages.length === city.wonders.length) {
      return EBuildType.ALREADY_BUILT;
    }

    if (!getPossibleBuildActions(player).includes(ESevenWondersCardActionType.BUILD_WONDER_STAGE)) {
      return EBuildType.NOT_ALLOWED;
    }

    return getBuildType(wonderLevelPrice, player, availableTradeVariants, 0);
  }, [availableTradeVariants, city.wonders.length, player, wonderLevelPrice]);

  const build = useCallback((payments?: TSevenWondersPayments) => {
    onCardAction({
      type: ESevenWondersCardActionType.BUILD_WONDER_STAGE,
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
      <Root className={b()} onClick={handleClick}>
        {getTitle(buildType)}
      </Root>

      <TradeModal
        isVisible={isTradeModalVisible}
        tradeVariants={availableTradeVariants}
        onBuild={build}
        onClose={closeTradeModal}
      />
    </>
  );
};

export default React.memo(BuildWonderLevelAction);
