import { EWaitingActionType, IPlayer } from 'common/types/sevenWonders';
import { IBuildCardEffect } from 'common/types/sevenWonders/effects';

export default function getWaitingBuildEffect(player: IPlayer): IBuildCardEffect | null {
  if (player.waitingForAction?.type !== EWaitingActionType.EFFECT_BUILD_CARD) {
    return null;
  }

  return player.buildCardEffects[player.waitingForAction.buildEffectIndex];
}
