import { GameType } from 'common/types/game';
import { GameClientEventType, TurnPlayerData, WaitingAction, WaitingActionType } from 'common/types/games/sevenWonders';

import { EntityGenerator } from 'common/utilities/Entity/Entity';
import ServerEntity from 'server/gamesData/Game/utilities/ServerEntity';

import SevenWondersGame from 'server/gamesData/Game/SevenWondersGame/SevenWondersGame';

export interface TurnOptions {
  startingWaitingAction: Exclude<WaitingActionType, WaitingActionType.EFFECT_BUILD_CARD>;
  executeActions(playersData: TurnPlayerData[]): number[] | void;
  getWaitingActions?(): (WaitingAction | null)[];
}

export default class Turn extends ServerEntity<GameType.SEVEN_WONDERS, number[]> {
  game: SevenWondersGame;

  playersData: TurnPlayerData[];
  getWaitingActions: TurnOptions['getWaitingActions'];
  executeActions: TurnOptions['executeActions'];

  constructor(game: SevenWondersGame, options: TurnOptions) {
    super(game);

    this.game = game;
    this.playersData = this.getPlayersData(() => ({
      receivedCoins: 0,
      chosenActionEvent: null,
      waitingForAction: {
        type: options.startingWaitingAction,
      },
    }));
    this.getWaitingActions = options.getWaitingActions;
    this.executeActions = options.executeActions;
  }

  *lifecycle(): EntityGenerator<number[]> {
    while (this.isWaitingForActions()) {
      while (this.isWaitingForActions()) {
        const { data: event, playerIndex } = yield* this.waitForSocketEvents([
          GameClientEventType.EXECUTE_ACTION,
          GameClientEventType.CANCEL_ACTION,
        ]);

        this.playersData[playerIndex].chosenActionEvent = event ?? null;

        this.game.sendGameInfo();
      }

      const receivedCoins = this.executeActions(this.playersData);
      const waitingActions = this.getWaitingActions?.();

      this.playersData = this.playersData.map((playerData, index) => ({
        receivedCoins: playerData.receivedCoins + (receivedCoins?.[index] ?? 0),
        chosenActionEvent: null,
        waitingForAction: waitingActions?.[index] ?? null,
      }));

      this.game.sendGameInfo();
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
