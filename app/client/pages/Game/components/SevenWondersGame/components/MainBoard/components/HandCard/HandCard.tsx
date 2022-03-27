import React, { useCallback, useMemo } from 'react';
import styled from 'styled-components';
import block from 'bem-cn';
import { first } from 'lodash';

import { ISevenWondersCard } from 'common/types/sevenWonders/cards';
import { IOwnerResource } from 'client/pages/Game/components/SevenWondersGame/components/MainBoard/types';
import { ISevenWondersPlayer, TSevenWondersPayments } from 'common/types/sevenWonders';

import getCardPurchaseVariants
  from 'client/pages/Game/components/SevenWondersGame/components/MainBoard/utilities/getCardPurchaseVariants';
import {
  TResourceTradePrices,
} from 'client/pages/Game/components/SevenWondersGame/components/MainBoard/utilities/getResourceTradePrices';
import getTradeVariants
  from 'client/pages/Game/components/SevenWondersGame/components/MainBoard/components/HandCard/utilities/getTradeVariants';
import getBuildType
  from 'client/pages/Game/components/SevenWondersGame/components/MainBoard/components/HandCard/utilities/getBuildType';
import getBuildTitle
  from 'client/pages/Game/components/SevenWondersGame/components/MainBoard/components/HandCard/utilities/getBuildTitle';

import Box from 'client/components/common/Box/Box';
import Card from 'client/pages/Game/components/SevenWondersGame/components/Card/Card';
import TradeModal
  from 'client/pages/Game/components/SevenWondersGame/components/MainBoard/components/HandCard/components/TradeModal/TradeModal';

import { useBoolean } from 'client/hooks/useBoolean';

interface IHandCardProps {
  card: ISevenWondersCard;
  player: ISevenWondersPlayer;
  resourcePools: IOwnerResource[][];
  resourceTradePrices: TResourceTradePrices;
  leftNeighbor: ISevenWondersPlayer;
  rightNeighbor: ISevenWondersPlayer;
  onBuild(card: ISevenWondersCard, payments?: TSevenWondersPayments): void;
}

export enum EBuildType {
  FREE = 'FREE',
  FOR_BUILDING = 'FOR_BUILDING',
  OWN_RESOURCES_AND_COINS = 'OWN_RESOURCES_AND_COINS',
  WITH_TRADE = 'WITH_TRADE',
  NOT_AVAILABLE = 'NOT_AVAILABLE',
}

const b = block('HandCard');

const Root = styled(Box)`

  .HandCard {

  }
`;

const HandCard: React.FC<IHandCardProps> = (props) => {
  const {
    card,
    card: {
      price: cardPrice,
    },
    player,
    resourcePools,
    resourceTradePrices,
    onBuild,
  } = props;

  const {
    value: isVisible,
    setTrue: open,
    setFalse: close,
  } = useBoolean(false);

  const purchaseVariants = useMemo(() => getCardPurchaseVariants(card, resourcePools), [card, resourcePools]);

  const tradeVariants = useMemo(() => getTradeVariants(purchaseVariants, resourceTradePrices), [purchaseVariants, resourceTradePrices]);

  const buildCard = useCallback((payments?: TSevenWondersPayments) => {
    onBuild(card, payments);
    close();
  }, [card, close, onBuild]);

  const buildType = useMemo((): EBuildType => getBuildType(cardPrice, player, tradeVariants), [cardPrice, player, tradeVariants]);

  const buildTitle = useMemo(() => getBuildTitle(buildType), [buildType]);

  const handleCardBuild = useCallback(() => {
    if (
      buildType === EBuildType.FREE ||
      buildType === EBuildType.FOR_BUILDING ||
      buildType === EBuildType.OWN_RESOURCES_AND_COINS
    ) {
      buildCard();
    } else if (buildType === EBuildType.WITH_TRADE) {
      open();
    }
  }, [buildType, buildCard, open]);

  return (
    <Root className={b()}>
      <Card card={card} isBuilt={false} buildTitle={buildTitle} onBuild={handleCardBuild} />

      <TradeModal
        isVisible={isVisible}
        tradeVariants={tradeVariants}
        onBuild={buildCard}
        onClose={close}
      />
    </Root>
  );
};

export default React.memo(HandCard);
