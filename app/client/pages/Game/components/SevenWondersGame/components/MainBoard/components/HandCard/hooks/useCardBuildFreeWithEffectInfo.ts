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

  // Now only for Olympia
  const ageBuildEffectIndex = useMemo(() => {
    const ageBuildCardEffects = player.buildCardEffects.filter((effect) => effect.period === ESevenWondersFreeCardPeriod.AGE);

    return ageBuildCardEffects.findIndex((effect) =>
      effect.cardTypes?.includes(card.type) ?? true,
    );
  }, [card.type, player.buildCardEffects]);

  const isAvailable = useMemo(() => {
    if (ageBuildEffectIndex !== -1) {
      return true;
    }

    if (!waitingBuildEffect) {
      return false;
    }

    if (waitingBuildEffect.type === ESevenWondersEffect.BUILD_CARD) {
      if (waitingBuildEffect.source === ESevenWondersFreeCardSource.DISCARD) {
        return true;
      }

      if (ageBuildEffectIndex !== -1) {
        return true;
      }
    }

    return false;
  }, [ageBuildEffectIndex, waitingBuildEffect]);

  const isPurchaseAvailable = useMemo(() => {
    if (!waitingBuildEffect) {
      return true;
    }

    if (waitingBuildEffect.type === ESevenWondersEffect.BUILD_CARD) {
      if (waitingBuildEffect.source === ESevenWondersFreeCardSource.DISCARD) {
        return false;
      }
    }

    return true;
  }, [waitingBuildEffect]);

  const title = useMemo(() => isAvailable ? 'Построить бесплатно с эффектом' : 'Нет эффекта', [isAvailable]);

  const onBuild = useCallback((cardIndex: number) => {
    onCardAction(cardIndex, {
      type: ESevenWondersCardActionType.BUILD_STRUCTURE,
      freeBuildType: ageBuildEffectIndex === -1 ? null : {
        type: EBuildType.FREE_WITH_EFFECT,
        effectIndex: ageBuildEffectIndex,
      },
    });
  }, [ageBuildEffectIndex, onCardAction]);

  return useMemo(() => ({
    isAvailable,
    isPurchaseAvailable,
    title,
    onBuild,
  }), [isAvailable, isPurchaseAvailable, onBuild, title]);
}
