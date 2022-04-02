import { ISevenWondersPlayer } from 'common/types/sevenWonders';
import { ISevenWondersCard } from 'common/types/sevenWonders/cards';
import { ESevenWondersFreeCardSource } from 'common/types/sevenWonders/effects';

import getWaitingBuildEffect from 'common/utilities/sevenWonders/getWaitingBuildEffect';

export default function getPlayerHandCards(player: ISevenWondersPlayer, discard: ISevenWondersCard[]): ISevenWondersCard[] {
  const buildEffect = getWaitingBuildEffect(player);

  if (buildEffect?.source === ESevenWondersFreeCardSource.DISCARD) {
    return discard;
  }

  return player.hand;
}
