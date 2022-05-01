import { PASS_DIRECTIONS } from 'server/gamesData/Game/HeartsGame/constants';

import { EGame } from 'common/types/game';
import { EGameEvent, EHandStage, EPassDirection, IPlayer, IRootState } from 'common/types/hearts';

import GameState from 'server/gamesData/Game/utilities/GameState';

import HandState from 'server/gamesData/Game/HeartsGame/states/HandState';

export default class RootState extends GameState<EGame.HEARTS, IRootState> {
  static createState(players: IPlayer[]): IRootState {
    return {
      players,
      handIndex: -1,
      passDirection: EPassDirection.NONE,
      handState: HandState.createState(players),
    };
  }

  constructor(players: IPlayer[]) {
    super(RootState.createState(players));
  }

  async lifecycle(): Promise<void> {
    const state = this.getRootState();
    const { players } = state;

    while (players.every(({ score }) => score < 100)) {
      state.handIndex++;
      state.passDirection = PASS_DIRECTIONS[players.length][state.handIndex % players.length];

      const scoreIncrements = await this.spawnState(
        new HandState(
          players,
          state.passDirection === EPassDirection.NONE ? EHandStage.PLAY : EHandStage.PASS,
        ),
      );

      scoreIncrements.forEach((scoreIncrement, playerIndex) => {
        players[playerIndex].score += scoreIncrement;
      });

      this.send(EGameEvent.ROOT_STATE, state);
    }
  }
}
