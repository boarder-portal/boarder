import { EGamePhase, IPlayer } from 'common/types/sevenWonders';
import { ICard } from 'common/types/sevenWonders/cards';
import { EFreeCardSource } from 'common/types/sevenWonders/effects';

import getWaitingBuildEffect from 'common/utilities/sevenWonders/getWaitingBuildEffect';

export default function getPlayerHandCards(
  player: IPlayer,
  discard: ICard[],
  phase: EGamePhase,
): ICard[] {
  const buildEffect = getWaitingBuildEffect(player);

  if (buildEffect?.source === EFreeCardSource.DISCARD) {
    return discard;
  }

  if (
    buildEffect?.source === EFreeCardSource.LEADERS
    || phase === EGamePhase.RECRUIT_LEADERS
  ) {
    return player.leadersHand;
  }

  if (phase === EGamePhase.DRAFT_LEADERS) {
    return player.leadersPool;
  }

  return player.hand;
}
