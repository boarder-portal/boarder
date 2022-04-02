import { ESevenWondersAdditionalActionType, ISevenWondersPlayer } from 'common/types/sevenWonders';
import { ISevenWondersCard } from 'common/types/sevenWonders/cards';
import { ESevenWondersFreeCardSource } from 'common/types/sevenWonders/effects';

export default function getPlayerHandCards(player: ISevenWondersPlayer, discard: ISevenWondersCard[]): ISevenWondersCard[] {
  if (player.waitingAdditionalAction?.type === ESevenWondersAdditionalActionType.BUILD_CARD) {
    const buildEffect = player.buildCardEffects[player.waitingAdditionalAction.buildEffectIndex];

    if (buildEffect.source === ESevenWondersFreeCardSource.DISCARD) {
      return discard;
    }
  }

  return player.hand;
}
