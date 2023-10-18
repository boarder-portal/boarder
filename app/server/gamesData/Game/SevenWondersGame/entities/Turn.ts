import { GameType } from 'common/types/game';
import { GameClientEventType, TurnPlayerData, WaitingAction, WaitingActionType } from 'common/types/games/sevenWonders';

import Entity, { EntityGenerator } from 'server/gamesData/Game/utilities/Entity/Entity';
import GameInfo from 'server/gamesData/Game/utilities/Entity/components/GameInfo';
import Server from 'server/gamesData/Game/utilities/Entity/components/Server';
import PlayersData from 'server/gamesData/Game/utilities/Entity/utilities/PlayersData';

import SevenWondersGame from 'server/gamesData/Game/SevenWondersGame/SevenWondersGame';

export interface TurnOptions {
  startingWaitingAction: Exclude<WaitingActionType, WaitingActionType.EFFECT_BUILD_CARD>;
  executeActions(playersData: PlayersData<TurnPlayerData>): number[] | void;
  getWaitingActions?(): (WaitingAction | null)[];
}

export default class Turn extends Entity<number[]> {
  game = this.getClosestEntity(SevenWondersGame);

  gameInfo = this.obtainComponent(GameInfo<GameType.SEVEN_WONDERS, this>);
  server = this.obtainComponent(Server<GameType.SEVEN_WONDERS, this>);

  playersData: PlayersData<TurnPlayerData>;
  getWaitingActions: TurnOptions['getWaitingActions'];
  executeActions: TurnOptions['executeActions'];

  constructor(options: TurnOptions) {
    super();

    this.playersData = this.gameInfo.createPlayersData<TurnPlayerData>({
      init: () => ({
        receivedCoins: 0,
        chosenActionEvent: null,
        waitingForAction: {
          type: options.startingWaitingAction,
        },
      }),
    });
    this.getWaitingActions = options.getWaitingActions;
    this.executeActions = options.executeActions;
  }

  *lifecycle(): EntityGenerator<number[]> {
    while (this.isWaitingForActions()) {
      while (this.isWaitingForActions()) {
        const { data: event, playerIndex } = yield* this.server.waitForSocketEvents([
          GameClientEventType.EXECUTE_ACTION,
          GameClientEventType.CANCEL_ACTION,
        ]);

        this.playersData.get(playerIndex).chosenActionEvent = event ?? null;

        this.server.sendGameInfo();
      }

      const receivedCoins = this.executeActions(this.playersData);
      const waitingActions = this.getWaitingActions?.();

      this.playersData.forEach((playerData, index) => {
        playerData.receivedCoins += receivedCoins?.[index] ?? 0;
        playerData.chosenActionEvent = null;
        playerData.waitingForAction = waitingActions?.[index] ?? null;
      });

      this.server.sendGameInfo();
    }

    return this.playersData.map(({ receivedCoins }) => receivedCoins);
  }

  isWaitingForAction = (playerData: TurnPlayerData): boolean => {
    return Boolean(playerData.waitingForAction && !playerData.chosenActionEvent);
  };

  isWaitingForActions(): boolean {
    return this.playersData.some(this.isWaitingForAction);
  }
}
