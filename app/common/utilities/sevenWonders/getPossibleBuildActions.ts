import { DEFAULT_CARD_ACTIONS } from 'common/constants/games/sevenWonders';

import { CardActionType, Player } from 'common/types/sevenWonders';

import { getPlayerWaitingBuildEffect } from 'common/utilities/sevenWonders/getWaitingBuildEffect';

export default function getPossibleBuildActions(player: Player): CardActionType[] {
  const waitingBuildEffect = getPlayerWaitingBuildEffect(player);

  return waitingBuildEffect?.possibleActions ?? DEFAULT_CARD_ACTIONS;
}
