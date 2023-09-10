import { Player, WaitingAction, WaitingActionType } from 'common/types/sevenWonders';
import { BuildCardEffect } from 'common/types/sevenWonders/effects';

export function getWaitingBuildEffect(
  waitingForAction: WaitingAction | null | undefined,
  buildCardEffects: BuildCardEffect[] | undefined,
): BuildCardEffect | null {
  if (waitingForAction?.type !== WaitingActionType.EFFECT_BUILD_CARD) {
    return null;
  }

  return buildCardEffects?.[waitingForAction.buildEffectIndex] ?? null;
}

export function getPlayerWaitingBuildEffect(player: Player): BuildCardEffect | null {
  return getWaitingBuildEffect(player.data.turn?.waitingForAction, player.data.age?.buildEffects);
}
