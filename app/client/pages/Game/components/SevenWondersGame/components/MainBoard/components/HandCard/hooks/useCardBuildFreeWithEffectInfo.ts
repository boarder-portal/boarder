import { useCallback, useMemo } from 'react';

import { ECardActionType, IPlayer, TAction, TBuildType, TPayments } from 'common/types/sevenWonders';
import { EBuildType } from 'client/pages/Game/components/SevenWondersGame/components/MainBoard/components/HandCard/types';
import { ECardId, ICard } from 'common/types/sevenWonders/cards';
import { EEffect, EFreeCardPeriod, EFreeCardSource } from 'common/types/sevenWonders/effects';

import { getPlayerWaitingBuildEffect } from 'common/utilities/sevenWonders/getWaitingBuildEffect';

export default function useCardBuildFreeWithEffectInfo(
  card: ICard,
  cardIndex: number,
  player: IPlayer,
  onCardAction: (action: TAction, payments?: TPayments) => void,
  onStartCopyingLeader: (cardIndex: number, action: TAction, payments?: TPayments) => void,
): {
  isAvailable: boolean;
  isPurchaseAvailable: boolean;
  title: string;
  onBuild(): void;
} {
  const waitingBuildEffect = useMemo(() => {
    return getPlayerWaitingBuildEffect(player);
  }, [player]);

  const infinityBuildEffectIndex = useMemo(() => {
    return (
      player.data.age?.buildEffects
        .filter((effect) => effect.count === undefined)
        .findIndex((effect) => effect.cardTypes?.includes(card.type) ?? true) ?? -1
    );
  }, [card.type, player.data.age]);

  const buildEffectIndex = useMemo(() => {
    if (infinityBuildEffectIndex !== -1) {
      return infinityBuildEffectIndex;
    }

    return (
      player.data.age?.buildEffects.findIndex(
        (effect) => effect.period === EFreeCardPeriod.AGE && (effect.cardTypes?.includes(card.type) ?? true),
      ) ?? -1
    );
  }, [card.type, infinityBuildEffectIndex, player.data.age]);

  const isAvailable = useMemo(() => {
    if (buildEffectIndex !== -1) {
      return true;
    }

    if (!waitingBuildEffect) {
      return false;
    }

    if (waitingBuildEffect.type === EEffect.BUILD_CARD) {
      if (waitingBuildEffect.source === EFreeCardSource.DISCARD) {
        return true;
      }

      if (buildEffectIndex !== -1) {
        return true;
      }
    }

    return false;
  }, [buildEffectIndex, waitingBuildEffect]);

  const isPurchaseAvailable = useMemo(() => {
    if (infinityBuildEffectIndex !== -1) {
      return false;
    }

    if (!waitingBuildEffect) {
      return true;
    }

    if (waitingBuildEffect.type === EEffect.BUILD_CARD) {
      if (waitingBuildEffect.source === EFreeCardSource.DISCARD) {
        return false;
      }
    }

    return true;
  }, [infinityBuildEffectIndex, waitingBuildEffect]);

  const title = useMemo(() => (isAvailable ? 'Построить бесплатно с эффектом' : 'Нет эффекта'), [isAvailable]);

  const onBuild = useCallback(() => {
    const freeBuildType: TBuildType | null =
      buildEffectIndex === -1
        ? null
        : {
            type: EBuildType.FREE_WITH_EFFECT,
            effectIndex: buildEffectIndex,
          };

    if (card.id === ECardId.COURTESANS_GUILD) {
      onStartCopyingLeader(cardIndex, {
        type: ECardActionType.BUILD_STRUCTURE,
        freeBuildType,
      });

      return;
    }

    onCardAction({
      type: ECardActionType.BUILD_STRUCTURE,
      freeBuildType,
    });
  }, [buildEffectIndex, card.id, cardIndex, onCardAction, onStartCopyingLeader]);

  return useMemo(
    () => ({
      isAvailable,
      isPurchaseAvailable,
      title,
      onBuild,
    }),
    [isAvailable, isPurchaseAvailable, onBuild, title],
  );
}
