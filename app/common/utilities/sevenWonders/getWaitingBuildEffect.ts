import { ESevenWondersAdditionalActionType, ISevenWondersPlayer } from 'common/types/sevenWonders';
import { ISevenWondersBuildCardEffect } from 'common/types/sevenWonders/effects';

export default function getWaitingBuildEffect(player: ISevenWondersPlayer): ISevenWondersBuildCardEffect | null {
  if (player.waitingAdditionalAction?.type !== ESevenWondersAdditionalActionType.BUILD_CARD) {
    return null;
  }

  return player.buildCardEffects[player.waitingAdditionalAction.buildEffectIndex];
}
