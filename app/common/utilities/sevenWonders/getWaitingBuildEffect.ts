import { EWaitingActionType, IPlayer, TWaitingAction } from 'common/types/sevenWonders';
import { IBuildCardEffect } from 'common/types/sevenWonders/effects';

export function getWaitingBuildEffect(
  waitingForAction: TWaitingAction | null | undefined,
  buildCardEffects: IBuildCardEffect[] | undefined,
): IBuildCardEffect | null {
  if (waitingForAction?.type !== EWaitingActionType.EFFECT_BUILD_CARD) {
    return null;
  }

  return buildCardEffects?.[waitingForAction.buildEffectIndex] ?? null;
}

export function getPlayerWaitingBuildEffect(player: IPlayer): IBuildCardEffect | null {
  return getWaitingBuildEffect(player.data.turn?.waitingForAction, player.data.age?.buildEffects);
}
