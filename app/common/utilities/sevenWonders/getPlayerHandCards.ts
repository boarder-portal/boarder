import { ESevenWondersGamePhase, ISevenWondersPlayer } from 'common/types/sevenWonders';
import { ISevenWondersCard } from 'common/types/sevenWonders/cards';
import { ESevenWondersFreeCardSource } from 'common/types/sevenWonders/effects';

import getWaitingBuildEffect from 'common/utilities/sevenWonders/getWaitingBuildEffect';

export default function getPlayerHandCards(
  player: ISevenWondersPlayer,
  discard: ISevenWondersCard[],
  phase: ESevenWondersGamePhase,
): ISevenWondersCard[] {
  if (phase === ESevenWondersGamePhase.DRAFT_LEADERS) {
    return player.leadersPool;
  }

  if (phase === ESevenWondersGamePhase.RECRUIT_LEADERS) {
    return player.leadersHand;
  }

  const buildEffect = getWaitingBuildEffect(player);

  if (buildEffect?.source === ESevenWondersFreeCardSource.DISCARD) {
    return discard;
  }

  return player.hand;
}
