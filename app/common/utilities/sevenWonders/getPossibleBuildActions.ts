import { DEFAULT_CARD_ACTIONS } from 'common/constants/sevenWonders';

import { ESevenWondersCardActionType, ISevenWondersPlayer } from 'common/types/sevenWonders';

import getWaitingBuildEffect from 'common/utilities/sevenWonders/getWaitingBuildEffect';

export default function getPossibleBuildActions(player: ISevenWondersPlayer): ESevenWondersCardActionType[]  {
  const waitingBuildEffect = getWaitingBuildEffect(player);

  return waitingBuildEffect?.possibleActions ?? DEFAULT_CARD_ACTIONS;
}
