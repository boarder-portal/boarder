import { EWaitingActionType, TWaitingAction } from 'common/types/sevenWonders';
import { IBuildCardEffect } from 'common/types/sevenWonders/effects';

export default function getWaitingBuildEffect(
  waitingForAction: TWaitingAction | null,
  buildCardEffects: IBuildCardEffect[],
): IBuildCardEffect | null {
  if (waitingForAction?.type !== EWaitingActionType.EFFECT_BUILD_CARD) {
    return null;
  }

  return buildCardEffects[waitingForAction.buildEffectIndex];
}
