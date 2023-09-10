import { AgePhaseType, GamePhaseType, WaitingAction } from 'common/types/sevenWonders';
import { Card } from 'common/types/sevenWonders/cards';
import { BuildCardEffect, FreeCardSourceType } from 'common/types/sevenWonders/effects';

import { getWaitingBuildEffect } from 'common/utilities/sevenWonders/getWaitingBuildEffect';

export interface GetPlayerHandCardsOptions {
  waitingForAction: WaitingAction | null | undefined;
  buildCardEffects: BuildCardEffect[] | undefined;
  gamePhase: GamePhaseType | null;
  agePhase: AgePhaseType | null;
  discard: Card[];
  leadersHand: Card[];
  leadersPool: Card[];
  hand: Card[];
}

export default function getPlayerHandCards(options: GetPlayerHandCardsOptions): Card[] {
  const buildEffect = getWaitingBuildEffect(options.waitingForAction, options.buildCardEffects);

  if (buildEffect?.source === FreeCardSourceType.DISCARD) {
    return options.discard;
  }

  if (buildEffect?.source === FreeCardSourceType.LEADERS || options.agePhase === AgePhaseType.RECRUIT_LEADERS) {
    return options.leadersHand;
  }

  if (options.gamePhase === GamePhaseType.DRAFT_LEADERS) {
    return options.leadersPool;
  }

  return options.hand;
}
