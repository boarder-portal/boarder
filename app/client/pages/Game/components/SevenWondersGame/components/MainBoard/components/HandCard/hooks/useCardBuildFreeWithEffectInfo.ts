import { useCallback, useMemo } from 'react';

import {
  ESevenWondersCardActionType,
  ISevenWondersPlayer,
  TSevenWondersAction,
  TSevenWondersPayments,
} from 'common/types/sevenWonders';
import {
  EBuildType,
} from 'client/pages/Game/components/SevenWondersGame/components/MainBoard/components/HandCard/types';
import { ISevenWondersCard } from 'common/types/sevenWonders/cards';
import {
  ESevenWondersFreeCardPeriod,
  ESevenWondersFreeCardSource,
  ESevenWondersEffect,
} from 'common/types/sevenWonders/effects';

import getWaitingBuildEffect from 'common/utilities/sevenWonders/getWaitingBuildEffect';

export default function useCardBuildFreeWithEffectInfo(
  card: ISevenWondersCard,
  player: ISevenWondersPlayer,
  onCardAction: (cardIndex: number, action: TSevenWondersAction, payments?: TSevenWondersPayments) => void,
): {
  isAvailable: boolean;
  isPurchaseAvailable: boolean;
  title: string;
  onBuild(cardIndex: number): void;
} {
  const waitingBuildEffect = useMemo(() => getWaitingBuildEffect(player), [player]);

  const infinityBuildEffectIndex = useMemo(() => {
    return player.buildCardEffects
      .filter((effect) => effect.count === undefined)
      .findIndex((effect) => effect.cardTypes?.includes(card.type) ?? true);
  }, [card.type, player.buildCardEffects]);

  const buildEffectIndex = useMemo(() => {
    if (infinityBuildEffectIndex !== -1) {
      return infinityBuildEffectIndex;
    }

    return player.buildCardEffects
      .findIndex((effect) =>
        effect.period === ESevenWondersFreeCardPeriod.AGE && (effect.cardTypes?.includes(card.type) ?? true),
      );
  }, [card.type, infinityBuildEffectIndex, player.buildCardEffects]);

  const isAvailable = useMemo(() => {
    if (buildEffectIndex !== -1) {
      return true;
    }

    if (!waitingBuildEffect) {
      return false;
    }

    if (waitingBuildEffect.type === ESevenWondersEffect.BUILD_CARD) {
      if (waitingBuildEffect.source === ESevenWondersFreeCardSource.DISCARD) {
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

    if (waitingBuildEffect.type === ESevenWondersEffect.BUILD_CARD) {
      if (waitingBuildEffect.source === ESevenWondersFreeCardSource.DISCARD) {
        return false;
      }
    }

    return true;
  }, [infinityBuildEffectIndex, waitingBuildEffect]);

  const title = useMemo(() => isAvailable ? 'Построить бесплатно с эффектом' : 'Нет эффекта', [isAvailable]);

  const onBuild = useCallback((cardIndex: number) => {
    onCardAction(cardIndex, {
      type: ESevenWondersCardActionType.BUILD_STRUCTURE,
      freeBuildType: buildEffectIndex === -1 ? null : {
        type: EBuildType.FREE_WITH_EFFECT,
        effectIndex: buildEffectIndex,
      },
    });
  }, [buildEffectIndex, onCardAction]);

  return useMemo(() => ({
    isAvailable,
    isPurchaseAvailable,
    title,
    onBuild,
  }), [isAvailable, isPurchaseAvailable, onBuild, title]);
}
