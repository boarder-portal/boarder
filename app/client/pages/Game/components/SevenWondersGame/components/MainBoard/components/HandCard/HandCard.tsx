import React, { useCallback, useMemo } from 'react';
import styled from 'styled-components';
import block from 'bem-cn';

import { ISevenWondersCard } from 'common/types/sevenWonders/cards';
import { IOwnerResource } from 'client/pages/Game/components/SevenWondersGame/components/MainBoard/types';
import { ISevenWondersPlayer } from 'common/types/sevenWonders';

import getCardPurchaseVariants
  from 'client/pages/Game/components/SevenWondersGame/components/MainBoard/utilities/getCardPurchaseVariants';

import Box from 'client/components/common/Box/Box';
import Card from 'client/pages/Game/components/SevenWondersGame/components/Card/Card';
import Modal from 'client/components/common/Modal/Modal';

import { useBoolean } from 'client/hooks/useBoolean';

interface IHandCardProps {
  card: ISevenWondersCard;
  resourcePools: IOwnerResource[][];
  leftNeighbor: ISevenWondersPlayer;
  rightNeighbor: ISevenWondersPlayer;
  onBuild(card: ISevenWondersCard): void;
}

const b = block('HandCard');

const Root = styled(Box)`

  .HandCard {

  }
`;

const HandCard: React.FC<IHandCardProps> = (props) => {
  const { card, resourcePools, onBuild } = props;

  const {
    value: isVisible,
    setTrue: open,
    setFalse: close,
  } = useBoolean(false);

  const purchaseVariants = useMemo(() => getCardPurchaseVariants(card, resourcePools), [card, resourcePools]);

  const handleBuild = useCallback(() => {
    onBuild(card);
    close();
  }, [card, close, onBuild]);

  const purchaseModalContent = useMemo(() => {
    if (!card.price?.resources) {
      return (
        <div onClick={handleBuild}>Построить бесплатно</div>
      );
    }

    if (!purchaseVariants.length) {
      return (
        <div>Нельзя построить</div>
      );
    }

    return purchaseVariants.map((purchaseVariant, index) => (
      <Box key={index} flex between={8}>
        {purchaseVariant.map((ownResource, index) => (
          <div key={index} onClick={handleBuild}>{`${ownResource.type} ${ownResource.owner.login}`}</div>
        ))}
      </Box>
    ));
  }, [card, handleBuild, purchaseVariants]);

  return (
    <Root className={b()}>
      <Card card={card} isBuilt={false} onBuild={open} />

      <Modal open={isVisible} onClose={close}>
        {purchaseModalContent}
      </Modal>
    </Root>
  );
};

export default React.memo(HandCard);
