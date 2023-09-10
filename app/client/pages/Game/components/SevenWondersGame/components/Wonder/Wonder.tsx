import React, { useMemo } from 'react';

import CITIES from 'common/constants/games/sevenWonders/cities';

import { EWaitingActionType, IPlayer } from 'common/types/sevenWonders';
import { EFreeCardSource } from 'common/types/sevenWonders/effects';
import { ECardId } from 'common/types/sevenWonders/cards';

import { isTradeEffect } from 'common/utilities/sevenWonders/isEffect';

import useCardGroups from 'client/pages/Game/components/SevenWondersGame/components/Wonder/hooks/useCardGroups';

import Card from 'client/pages/Game/components/SevenWondersGame/components/Card/Card';
import BackCard from 'client/pages/Game/components/SevenWondersGame/components/MainBoard/components/BackCard/BackCard';
import Image from 'client/components/common/Image/Image';
import Flex from 'client/components/common/Flex/Flex';

import styles from './Wonder.module.scss';

interface IWonderProps {
  className?: string;
  player: IPlayer;
  copiedLeaderId?: ECardId;
  isOtherPlayer?: boolean;
}

const GROUP_HEIGHT = 125;
const CARD_DEFAULT_GROUP_VERTICAL_SPACE = 33;

const Wonder: React.FC<IWonderProps> = (props) => {
  const { className, player, copiedLeaderId, isOtherPlayer } = props;

  const cardGroups = useCardGroups(player);

  const currentAction = useMemo(() => {
    if (player.data.turn?.chosenActionEvent || !player.data.turn?.waitingForAction) {
      return 'Ожидает';
    }

    if (player.data.turn?.waitingForAction?.type === EWaitingActionType.EFFECT_BUILD_CARD) {
      const buildEffect = player.data.age?.buildEffects[player.data.turn.waitingForAction.buildEffectIndex];

      if (buildEffect?.source === EFreeCardSource.DISCARD) {
        return 'Выбор из сброса';
      }

      if (buildEffect?.source === EFreeCardSource.LEADERS) {
        return 'Найм лидера';
      }

      return 'Строительство последней карты';
    }

    if (player.data.turn?.waitingForAction?.type === EWaitingActionType.PICK_LEADER) {
      return 'Выбирает лидера';
    }

    if (player.data.turn?.waitingForAction?.type === EWaitingActionType.RECRUIT_LEADER) {
      return 'Нанимает лидера';
    }

    if (player.data.turn?.waitingForAction?.type === EWaitingActionType.BUILD_CARD) {
      return 'Выбирает карту';
    }
  }, [player.data.age, player.data.turn]);

  const warPoints = useMemo(
    () => [...player.data.victoryPoints, ...player.data.defeatPoints],
    [player.data.defeatPoints, player.data.victoryPoints],
  );

  return (
    <div className={className}>
      <Flex className={styles.cardGroups} justifyContent="spaceBetween">
        {cardGroups.map((group, index) => {
          const cardVerticalSpace = Math.min(GROUP_HEIGHT / group.length, CARD_DEFAULT_GROUP_VERTICAL_SPACE);

          return (
            <div className={styles.cardGroup} key={index}>
              {group.map((card, cardIndex) => (
                <Card
                  key={cardIndex}
                  className={styles.card}
                  style={{ top: `${GROUP_HEIGHT - cardVerticalSpace * (cardIndex + 1)}px`, zIndex: 10 - cardIndex }}
                  card={card}
                  flip={
                    isOtherPlayer && card.effects.some((effect) => isTradeEffect(effect) && effect.sources.length === 1)
                  }
                  width={100}
                  isCopiedLeader={card.id === copiedLeaderId}
                  zoomOnHover
                />
              ))}
            </div>
          );
        })}
      </Flex>

      <div className={styles.wonderImageWrapper}>
        <Image
          className={styles.wonderCard}
          src={`/sevenWonders/cities/${player.data.city}/${player.data.citySide}.png`}
        />

        {player.data.builtStages.map(({ index, cardType }) => {
          const position =
            CITIES[player.data.city].sides[player.data.citySide].wonders[index].position ?? 0.088 + 0.3 * index;

          return (
            <BackCard
              key={index}
              className={styles.builtStage}
              type={cardType}
              style={{ left: `${position * 100}%` }}
            />
          );
        })}
      </div>

      <Flex className={styles.info} between={2}>
        <div>{player.name}</div>
        {player.data.points > 0 && <div>{`Очки: ${player.data.points}`}</div>}
        <div>{`Монет: ${player.data.coins}`}</div>
        {warPoints.length ? <div>{`Война ${warPoints.join(', ')}`}</div> : null}
        <div>{currentAction}</div>
      </Flex>
    </div>
  );
};

export default React.memo(Wonder);
