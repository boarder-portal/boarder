import { FC, memo, useCallback } from 'react';

import { NeighborSide, Payments } from 'common/types/games/sevenWonders';

import { TradeVariant } from 'client/components/games/sevenWonders/SevenWondersGame/components/SevenWondersGameContent/components/MainBoard/components/HandCard/utilities/getTradeVariantsByPurchaseVariants';

import Flex from 'client/components/common/Flex/Flex';
import Modal, { BaseModalProps } from 'client/components/common/Modal/Modal';
import Text from 'client/components/common/Text/Text';
import ResourcesAndPrice from 'client/components/games/sevenWonders/SevenWondersGame/components/SevenWondersGameContent/components/MainBoard/components/HandCard/components/TradeModal/components/ResourcesAndPrice/ResourcesAndPrice';

import { HOVER_SOUND, playSound } from 'client/sounds';

import styles from './TradeModal.module.scss';

interface TradeModalProps extends BaseModalProps {
  tradeVariants: TradeVariant[];
  onBuild(payments?: Payments): void;
}

const TradeModal: FC<TradeModalProps> = (props) => {
  const { open, tradeVariants, onBuild, onClose } = props;

  const handleSelectTradeVariant = useCallback(
    (payments: Payments) => {
      onBuild(payments);
      onClose?.();
    },
    [onBuild, onClose],
  );

  const handleHoverTradeVariant = useCallback(() => {
    playSound(HOVER_SOUND);
  }, []);

  return (
    <Modal contentClassName={styles.modalContent} open={open} title="Торговые варианты" onClose={onClose}>
      <Flex className={styles.content} direction="column" between={2}>
        <Flex className={styles.head} justifyContent="spaceBetween">
          <Text weight="bold" size="l">
            Left
          </Text>
          <Text weight="bold" size="l">
            Bank
          </Text>
          <Text weight="bold" size="l">
            Right
          </Text>
        </Flex>

        <Flex className={styles.variants} direction="column" between={2}>
          {tradeVariants.map((tradeVariant, index) => (
            <div
              key={index}
              className={styles.tradeVariant}
              onMouseEnter={handleHoverTradeVariant}
              onClick={handleSelectTradeVariant.bind(null, tradeVariant.payments)}
            >
              <ResourcesAndPrice
                price={tradeVariant.payments.LEFT}
                resources={tradeVariant.resources.filter((resource) => resource.owner === NeighborSide.LEFT)}
              />

              <ResourcesAndPrice
                price={tradeVariant.payments.bank}
                resources={tradeVariant.resources.filter((resource) => resource.owner === 'bank')}
              />

              <ResourcesAndPrice
                price={tradeVariant.payments.RIGHT}
                resources={tradeVariant.resources.filter((resource) => resource.owner === NeighborSide.RIGHT)}
                reverse
              />
            </div>
          ))}
        </Flex>
      </Flex>
    </Modal>
  );
};

export default memo(TradeModal);
