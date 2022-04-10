import { ESevenWondersWaitingActionType, ISevenWondersPlayer } from 'common/types/sevenWonders';
import { ISevenWondersBuildCardEffect } from 'common/types/sevenWonders/effects';

export default function getWaitingBuildEffect(player: ISevenWondersPlayer): ISevenWondersBuildCardEffect | null {
  if (player.waitingForAction?.type !== ESevenWondersWaitingActionType.EFFECT_BUILD_CARD) {
    return null;
  }

  return player.buildCardEffects[player.waitingForAction.buildEffectIndex];
}
