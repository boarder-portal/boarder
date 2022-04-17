import { DEFAULT_CARD_ACTIONS } from 'common/constants/games/sevenWonders';

import { ECardActionType, IPlayer } from 'common/types/sevenWonders';

import getWaitingBuildEffect from 'common/utilities/sevenWonders/getWaitingBuildEffect';

export default function getPossibleBuildActions(player: IPlayer): ECardActionType[]  {
  const waitingBuildEffect = getWaitingBuildEffect(player);

  return waitingBuildEffect?.possibleActions ?? DEFAULT_CARD_ACTIONS;
}
