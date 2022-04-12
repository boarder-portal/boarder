import { ESevenWondersGamePhase, ISevenWondersPlayer } from 'common/types/sevenWonders';
import { ESevenWondersCardType, ISevenWondersCard } from 'common/types/sevenWonders/cards';

import getPlayerHandCards from 'common/utilities/sevenWonders/getPlayerHandCards';

export default function getHand(
  player: ISevenWondersPlayer,
  discard: ISevenWondersCard[],
  phase: ESevenWondersGamePhase,
  isCopyingLeader: boolean,
  leftNeighbor: ISevenWondersPlayer,
  rightNeighbor: ISevenWondersPlayer,
  isViewingLeaders: boolean,
): ISevenWondersCard[] {
  if (isViewingLeaders) {
    return player.leadersHand;
  }

  if (isCopyingLeader) {
    return [...leftNeighbor.builtCards, ...rightNeighbor.builtCards].filter((card) => card.type === ESevenWondersCardType.LEADER);
  }

  return getPlayerHandCards(player, discard, phase);
}
