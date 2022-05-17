import { EGamePhase, IPlayer } from 'common/types/sevenWonders';
import { ECardType, ICard } from 'common/types/sevenWonders/cards';

import getPlayerHandCards, { IGetPlayerHandCardsOptions } from 'common/utilities/sevenWonders/getPlayerHandCards';

export interface IGetHandOptions extends IGetPlayerHandCardsOptions {
  pickedLeaders: ICard[];
  isCopyingLeader: boolean;
  leftNeighbor: IPlayer;
  rightNeighbor: IPlayer;
  isViewingLeaders: boolean;
}

export default function getHand(options: IGetHandOptions): ICard[] {
  if (options.isViewingLeaders) {
    return options.gamePhase === EGamePhase.DRAFT_LEADERS ? options.pickedLeaders : options.leadersHand;
  }

  if (options.isCopyingLeader) {
    return [...options.leftNeighbor.builtCards, ...options.rightNeighbor.builtCards].filter(
      (card) => card.type === ECardType.LEADER,
    );
  }

  return getPlayerHandCards(options);
}
