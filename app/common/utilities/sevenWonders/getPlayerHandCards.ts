import { EAgePhase, EGamePhase, TWaitingAction } from 'common/types/sevenWonders';
import { ICard } from 'common/types/sevenWonders/cards';
import { EFreeCardSource, IBuildCardEffect } from 'common/types/sevenWonders/effects';

import getWaitingBuildEffect from 'common/utilities/sevenWonders/getWaitingBuildEffect';

export interface IGetPlayerHandCardsOptions {
  waitingForAction: TWaitingAction | null;
  buildCardEffects: IBuildCardEffect[];
  gamePhase: EGamePhase | null;
  agePhase: EAgePhase | null;
  discard: ICard[];
  leadersHand: ICard[];
  leadersPool: ICard[];
  hand: ICard[];
}

export default function getPlayerHandCards(options: IGetPlayerHandCardsOptions): ICard[] {
  const buildEffect = getWaitingBuildEffect(options.waitingForAction, options.buildCardEffects);

  if (buildEffect?.source === EFreeCardSource.DISCARD) {
    return options.discard;
  }

  if (buildEffect?.source === EFreeCardSource.LEADERS || options.agePhase === EAgePhase.RECRUIT_LEADERS) {
    return options.leadersHand;
  }

  if (options.gamePhase === EGamePhase.DRAFT_LEADERS) {
    return options.leadersPool;
  }

  return options.hand;
}
