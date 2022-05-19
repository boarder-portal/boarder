import { DEFAULT_CARD_ACTIONS } from 'common/constants/games/sevenWonders';

import { ECardActionType, IPlayer } from 'common/types/sevenWonders';

import { getPlayerWaitingBuildEffect } from 'common/utilities/sevenWonders/getWaitingBuildEffect';

export default function getPossibleBuildActions(player: IPlayer): ECardActionType[] {
  const waitingBuildEffect = getPlayerWaitingBuildEffect(player);

  return waitingBuildEffect?.possibleActions ?? DEFAULT_CARD_ACTIONS;
}
