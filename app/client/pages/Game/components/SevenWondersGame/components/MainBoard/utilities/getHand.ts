import { GamePhaseType, Player } from 'common/types/sevenWonders';
import { Card, CardType } from 'common/types/sevenWonders/cards';

import getPlayerHandCards, { GetPlayerHandCardsOptions } from 'common/utilities/sevenWonders/getPlayerHandCards';

export interface GetHandOptions extends GetPlayerHandCardsOptions {
  pickedLeaders: Card[];
  isCopyingLeader: boolean;
  leftNeighbor: Player;
  rightNeighbor: Player;
  isViewingLeaders: boolean;
}

export default function getHand(options: GetHandOptions): Card[] {
  if (options.isViewingLeaders) {
    return options.gamePhase === GamePhaseType.DRAFT_LEADERS ? options.pickedLeaders : options.leadersHand;
  }

  if (options.isCopyingLeader) {
    return [...options.leftNeighbor.data.builtCards, ...options.rightNeighbor.data.builtCards].filter(
      (card) => card.type === CardType.LEADER,
    );
  }

  return getPlayerHandCards(options);
}
