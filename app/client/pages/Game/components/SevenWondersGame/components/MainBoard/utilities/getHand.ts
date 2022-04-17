import { EGamePhase, IPlayer } from 'common/types/sevenWonders';
import { ECardType, ICard } from 'common/types/sevenWonders/cards';

import getPlayerHandCards from 'common/utilities/sevenWonders/getPlayerHandCards';

export default function getHand(
  player: IPlayer,
  discard: ICard[],
  phase: EGamePhase,
  isCopyingLeader: boolean,
  leftNeighbor: IPlayer,
  rightNeighbor: IPlayer,
  isViewingLeaders: boolean,
): ICard[] {
  if (isViewingLeaders) {
    return player.leadersHand;
  }

  if (isCopyingLeader) {
    return [...leftNeighbor.builtCards, ...rightNeighbor.builtCards].filter((card) => card.type === ECardType.LEADER);
  }

  return getPlayerHandCards(player, discard, phase);
}
