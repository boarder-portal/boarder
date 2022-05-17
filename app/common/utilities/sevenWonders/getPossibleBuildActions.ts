import { DEFAULT_CARD_ACTIONS } from 'common/constants/games/sevenWonders';

import { ECardActionType, TWaitingAction } from 'common/types/sevenWonders';
import { IBuildCardEffect } from 'common/types/sevenWonders/effects';

import getWaitingBuildEffect from 'common/utilities/sevenWonders/getWaitingBuildEffect';

export default function getPossibleBuildActions(
  waitingForAction: TWaitingAction | null,
  buildCardEffects: IBuildCardEffect[],
): ECardActionType[] {
  const waitingBuildEffect = getWaitingBuildEffect(waitingForAction, buildCardEffects);

  return waitingBuildEffect?.possibleActions ?? DEFAULT_CARD_ACTIONS;
}
