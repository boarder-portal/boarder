import { useCallback, useMemo } from 'react';

import { ECardActionType, TAction, TBuildType, TPayments, TWaitingAction } from 'common/types/sevenWonders';
import { EBuildType } from 'client/pages/Game/components/SevenWondersGame/components/MainBoard/components/HandCard/types';
import { ECardId, ICard } from 'common/types/sevenWonders/cards';
import { EEffect, EFreeCardPeriod, EFreeCardSource, IBuildCardEffect } from 'common/types/sevenWonders/effects';

import getWaitingBuildEffect from 'common/utilities/sevenWonders/getWaitingBuildEffect';

export default function useCardBuildFreeWithEffectInfo(
  card: ICard,
  cardIndex: number,
  waitingForAction: TWaitingAction | null,
  buildCardEffects: IBuildCardEffect[],
  onCardAction: (action: TAction, payments?: TPayments) => void,
  onStartCopyingLeader: (cardIndex: number, action: TAction, payments?: TPayments) => void,
): {
  isAvailable: boolean;
  isPurchaseAvailable: boolean;
  title: string;
  onBuild(): void;
} {
  const waitingBuildEffect = useMemo(() => {
    return getWaitingBuildEffect(waitingForAction, buildCardEffects);
  }, [buildCardEffects, waitingForAction]);

  const infinityBuildEffectIndex = useMemo(() => {
    return buildCardEffects
      .filter((effect) => effect.count === undefined)
      .findIndex((effect) => effect.cardTypes?.includes(card.type) ?? true);
  }, [buildCardEffects, card.type]);

  const buildEffectIndex = useMemo(() => {
    if (infinityBuildEffectIndex !== -1) {
      return infinityBuildEffectIndex;
    }

    return buildCardEffects.findIndex(
      (effect) => effect.period === EFreeCardPeriod.AGE && (effect.cardTypes?.includes(card.type) ?? true),
    );
  }, [buildCardEffects, card.type, infinityBuildEffectIndex]);

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
