import { GameType } from 'common/types/game';
import { LeadersDraftPlayerData, WaitingActionType } from 'common/types/games/sevenWonders';
import { Card } from 'common/types/games/sevenWonders/cards';

import { EntityGenerator } from 'common/utilities/Entity';
import rotateObjects from 'common/utilities/rotateObjects';
import ServerEntity from 'server/gamesData/Game/utilities/ServerEntity';

import SevenWondersGame from 'server/gamesData/Game/SevenWondersGame/SevenWondersGame';
import Turn from 'server/gamesData/Game/SevenWondersGame/entities/Turn';

export default class LeadersDraft extends ServerEntity<GameType.SEVEN_WONDERS, Card[][]> {
  game: SevenWondersGame;

  playersData: LeadersDraftPlayerData[] = this.getPlayersData(() => ({
    leadersPool: [],
    pickedLeaders: [],
  }));

  turn: Turn | null = null;

  constructor(game: SevenWondersGame) {
    super(game);

    this.game = game;
  }

  *lifecycle(): EntityGenerator<Card[][]> {
    this.forEachPlayer((playerIndex) => {
      this.playersData[playerIndex].leadersPool = this.game.extractFromLeadersDeck(4);
    });

    while (this.playersData.every(({ leadersPool }) => leadersPool.length !== 1)) {
      this.turn = new Turn(this.game, {
        startingWaitingAction: WaitingActionType.PICK_LEADER,
        executeActions: (actions) => {
          actions.forEach(({ chosenActionEvent }, playerIndex) => {
            if (chosenActionEvent) {
              const { leadersPool, pickedLeaders } = this.playersData[playerIndex];

              pickedLeaders.push(...leadersPool.splice(chosenActionEvent.cardIndex, 1));
            }
          });
        },
      });

      this.game.sendGameInfo();

      yield* this.waitForEntity(this.turn);

      const newLeadersPools = rotateObjects(
        this.playersData.map(({ leadersPool }) => leadersPool),
        this.game.getAgeDirection(),
      );

      this.playersData.forEach((playerData, index) => {
        playerData.leadersPool = newLeadersPools[index];
      });

      this.game.sendGameInfo();
    }

    this.turn = null;

    this.playersData.forEach(({ leadersPool, pickedLeaders }) => {
      pickedLeaders.push(...leadersPool.splice(0));
    });

    return this.playersData.map(({ pickedLeaders }) => pickedLeaders);
  }
}
