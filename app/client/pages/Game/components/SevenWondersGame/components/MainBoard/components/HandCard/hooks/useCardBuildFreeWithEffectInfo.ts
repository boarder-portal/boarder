import { useCallback, useMemo } from 'react';

import { BuildKind } from 'client/pages/Game/components/SevenWondersGame/components/MainBoard/components/HandCard/types';
import { Action, BuildType, CardActionType, Payments, Player } from 'common/types/games/sevenWonders';
import { Card, CardId } from 'common/types/games/sevenWonders/cards';
import { EffectType, FreeCardPeriodType, FreeCardSourceType } from 'common/types/games/sevenWonders/effects';

import { getPlayerWaitingBuildEffect } from 'common/utilities/games/sevenWonders/getWaitingBuildEffect';

export default function useCardBuildFreeWithEffectInfo(
  card: Card,
  cardIndex: number,
  player: Player,
  onCardAction: (action: Action, payments?: Payments) => void,
  onStartCopyingLeader: (cardIndex: number, action: Action, payments?: Payments) => void,
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
      player.data.age?.buildEffects.findIndex(
        (effect) => effect.count === undefined && (effect.cardTypes?.includes(card.type) ?? true),
      ) ?? -1
    );
  }, [card.type, player.data.age]);

  const buildEffectIndex = useMemo(() => {
    if (infinityBuildEffectIndex !== -1) {
      return infinityBuildEffectIndex;
    }

    return (
      player.data.age?.buildEffects.findIndex(
        (effect) => effect.period === FreeCardPeriodType.AGE && (effect.cardTypes?.includes(card.type) ?? true),
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

    if (waitingBuildEffect.type === EffectType.BUILD_CARD) {
      if (waitingBuildEffect.source === FreeCardSourceType.DISCARD) {
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

    if (waitingBuildEffect.type === EffectType.BUILD_CARD) {
      if (waitingBuildEffect.source === FreeCardSourceType.DISCARD) {
        return false;
      }
    }

    return true;
  }, [infinityBuildEffectIndex, waitingBuildEffect]);

  const title = useMemo(() => (isAvailable ? 'Построить бесплатно с эффектом' : 'Нет эффекта'), [isAvailable]);

  const onBuild = useCallback(() => {
    const freeBuildType: BuildType | null =
      buildEffectIndex === -1
        ? null
        : {
            type: BuildKind.FREE_WITH_EFFECT,
            effectIndex: buildEffectIndex,
          };

    if (card.id === CardId.COURTESANS_GUILD) {
      onStartCopyingLeader(cardIndex, {
        type: CardActionType.BUILD_STRUCTURE,
        freeBuildType,
      });

      return;
    }

    onCardAction({
      type: CardActionType.BUILD_STRUCTURE,
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
