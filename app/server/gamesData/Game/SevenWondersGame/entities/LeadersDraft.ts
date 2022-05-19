import { EGame } from 'common/types/game';
import { ICard } from 'common/types/sevenWonders/cards';
import { EWaitingActionType, ILeadersDraftPlayerData } from 'common/types/sevenWonders';

import GameEntity from 'server/gamesData/Game/utilities/GameEntity';
import rotateObjects from 'common/utilities/rotateObjects';

import SevenWondersGame from 'server/gamesData/Game/SevenWondersGame/entities/SevenWondersGame';
import Turn from 'server/gamesData/Game/SevenWondersGame/entities/Turn';

export default class LeadersDraft extends GameEntity<EGame.SEVEN_WONDERS, ICard[][]> {
  game: SevenWondersGame;

  playersData: ILeadersDraftPlayerData[];

  turn: Turn | null = null;

  constructor(game: SevenWondersGame) {
    super(game);

    this.game = game;
    this.playersData = this.players.map(() => ({
      leadersPool: [],
      pickedLeaders: [],
    }));
  }

  *lifecycle() {
    this.players.forEach((player, index) => {
      this.playersData[index].leadersPool = this.game.extractFromLeadersDeck(4);
    });

    while (this.playersData.every(({ leadersPool }) => leadersPool.length !== 1)) {
      this.turn = this.spawnEntity(
        new Turn(this.game, {
          startingWaitingAction: EWaitingActionType.PICK_LEADER,
          executeActions: (actions) => {
            actions.forEach(({ chosenActionEvent }, playerIndex) => {
              if (chosenActionEvent) {
                const { leadersPool, pickedLeaders } = this.playersData[playerIndex];

                pickedLeaders.push(...leadersPool.splice(chosenActionEvent.cardIndex, 1));
              }
            });
          },
        }),
      );

      this.game.sendGameInfo();

      yield* this.turn;

      const newLeadersPools = rotateObjects(
        this.playersData.map(({ leadersPool }) => leadersPool),
        1,
      );

      this.playersData.forEach((playerData, index) => {
        playerData.leadersPool = newLeadersPools[index];
      });

      this.game.sendGameInfo();
    }

    this.playersData.forEach(({ leadersPool, pickedLeaders }) => {
      pickedLeaders.push(...leadersPool.splice(0));
    });

    return this.playersData.map(({ pickedLeaders }) => pickedLeaders);
  }
}
