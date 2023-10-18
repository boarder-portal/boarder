import { GameType } from 'common/types/game';
import { LeadersDraftPlayerData, WaitingActionType } from 'common/types/games/sevenWonders';
import { Card } from 'common/types/games/sevenWonders/cards';

import rotateObjects from 'common/utilities/rotateObjects';
import Entity, { EntityGenerator } from 'server/gamesData/Game/utilities/Entity/Entity';
import GameInfo from 'server/gamesData/Game/utilities/Entity/components/GameInfo';
import Server from 'server/gamesData/Game/utilities/Entity/components/Server';

import SevenWondersGame from 'server/gamesData/Game/SevenWondersGame/SevenWondersGame';
import Turn from 'server/gamesData/Game/SevenWondersGame/entities/Turn';

export default class LeadersDraft extends Entity<Card[][]> {
  game = this.getClosestEntity(SevenWondersGame);

  gameInfo = this.obtainComponent(GameInfo<GameType.SEVEN_WONDERS, this>);
  server = this.obtainComponent(Server<GameType.SEVEN_WONDERS, this>);

  playersData = this.gameInfo.createPlayersData<LeadersDraftPlayerData>({
    init: () => ({
      leadersPool: [],
      pickedLeaders: [],
    }),
  });

  turn: Turn | null = null;

  *lifecycle(): EntityGenerator<Card[][]> {
    this.playersData.forEach((playerData) => {
      playerData.leadersPool = this.game.extractFromLeadersDeck(4);
    });

    while (this.playersData.every(({ leadersPool }) => leadersPool.length !== 1)) {
      this.turn = this.spawnEntity(Turn, {
        startingWaitingAction: WaitingActionType.PICK_LEADER,
        executeActions: (actions) => {
          actions.forEach(({ chosenActionEvent }, playerIndex) => {
            if (chosenActionEvent) {
              const { leadersPool, pickedLeaders } = this.playersData.get(playerIndex);

              pickedLeaders.push(...leadersPool.splice(chosenActionEvent.cardIndex, 1));
            }
          });
        },
      });

      this.server.sendGameInfo();

      yield* this.waitForEntity(this.turn);

      const newLeadersPools = rotateObjects(
        this.playersData.map(({ leadersPool }) => leadersPool),
        this.game.getAgeDirection(),
      );

      this.playersData.forEach((playerData, index) => {
        playerData.leadersPool = newLeadersPools[index];
      });

      this.server.sendGameInfo();
    }

    this.turn = null;

    this.playersData.forEach(({ leadersPool, pickedLeaders }) => {
      pickedLeaders.push(...leadersPool.splice(0));
    });

    return this.playersData.map(({ pickedLeaders }) => pickedLeaders);
  }
}
