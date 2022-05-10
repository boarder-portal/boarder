import React, { useMemo } from 'react';

import { EWaitingActionType, IPlayer } from 'common/types/sevenWonders';
import { EFreeCardSource } from 'common/types/sevenWonders/effects';
import { ECardId } from 'common/types/sevenWonders/cards';

import { isTradeEffect } from 'common/utilities/sevenWonders/isEffect';

import Box from 'client/components/common/Box/Box';
import Card from 'client/pages/Game/components/SevenWondersGame/components/Card/Card';
import useCardGroups from 'client/pages/Game/components/SevenWondersGame/components/Wonder/hooks/useCardGroups';
import BackCard from 'client/pages/Game/components/SevenWondersGame/components/MainBoard/components/BackCard/BackCard';

import styles from './Wonder.pcss';

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
    if (player.chosenActionEvent || !player.waitingForAction) {
      return 'Ожидает';
    }

    if (player.waitingForAction?.type === EWaitingActionType.EFFECT_BUILD_CARD) {
      const buildEffect = player.buildCardEffects[player.waitingForAction.buildEffectIndex];

      if (buildEffect.source === EFreeCardSource.DISCARD) {
        return 'Выбор из сброса';
      }

      if (buildEffect.source === EFreeCardSource.LEADERS) {
        return 'Найм лидера';
      }

      return 'Строительство последней карты';
    }

    if (player.waitingForAction?.type === EWaitingActionType.PICK_LEADER) {
      return 'Выбирает лидера';
    }

    if (player.waitingForAction?.type === EWaitingActionType.RECRUIT_LEADER) {
      return 'Нанимает лидера';
    }

    if (player.waitingForAction?.type === EWaitingActionType.BUILD_CARD) {
      return 'Выбирает карту';
    }
  }, [player]);

  const warPoints = useMemo(() => [...player.victoryPoints, ...player.defeatPoints], [player.defeatPoints, player.victoryPoints]);

  return (
    <Box className={className}>
      <Box className={styles.cardGroups} flex justifyContent="space-between">
        {cardGroups.map((group, index) => {
          const cardVerticalSpace = Math.min(GROUP_HEIGHT / group.length, CARD_DEFAULT_GROUP_VERTICAL_SPACE);

          return (
            <div className={styles.cardGroup} key={index}>
              {group.map((card, cardIndex) => (
                <Card
                  key={cardIndex}
                  className={styles.card}
                  style={{ top: `${(GROUP_HEIGHT - cardVerticalSpace * (cardIndex + 1))}px`, zIndex: 10 - cardIndex }}
                  card={card}
                  flip={isOtherPlayer && card.effects.some((effect) =>
                    isTradeEffect(effect) && effect.sources.length === 1)}
                  width={100}
                  isCopiedLeader={card.id === copiedLeaderId}
                  zoomOnHover
                />
              ))}
            </div>
          );
        })}
      </Box>

      <div className={styles.wonderImageWrapper}>
        <img className={styles.wonderCard} src={`/sevenWonders/cities/${player.city}/${player.citySide}.png`} />

        {player.builtStages.map((builtStage, index) => (
          <BackCard key={index} className={styles.builtStage} type={builtStage.cardType} style={{ left: `${9 + 30 * index}%` }} />
        ))}
      </div>

      <Box flex between={8} mt={16}>
        <div>{player.login}</div>
        {player.points > 0 && <div>{`Очки: ${player.points}`}</div>}
        <div>{`Монет: ${player.coins}`}</div>
        {warPoints.length ? <div>{`Война ${warPoints.join(', ')}`}</div> : null}
        <div>{currentAction}</div>
      </Box>
    </Box>
  );
};

export default React.memo(Wonder);
