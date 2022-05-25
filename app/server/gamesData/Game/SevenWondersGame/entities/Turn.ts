import { EGame } from 'common/types/game';
import { EGameClientEvent, EWaitingActionType, ITurnPlayerData, TWaitingAction } from 'common/types/sevenWonders';

import { TGenerator } from 'server/gamesData/Game/utilities/Entity';
import ServerEntity from 'server/gamesData/Game/utilities/ServerEntity';

import SevenWondersGame from 'server/gamesData/Game/SevenWondersGame/SevenWondersGame';

export interface ITurnOptions {
  startingWaitingAction: Exclude<EWaitingActionType, EWaitingActionType.EFFECT_BUILD_CARD>;
  executeActions(playersData: ITurnPlayerData[]): number[] | void;
  getWaitingActions?(): (TWaitingAction | null)[];
}

export default class Turn extends ServerEntity<EGame.SEVEN_WONDERS, number[]> {
  game: SevenWondersGame;

  playersData: ITurnPlayerData[];
  getWaitingActions: ITurnOptions['getWaitingActions'];
  executeActions: ITurnOptions['executeActions'];

  constructor(game: SevenWondersGame, options: ITurnOptions) {
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

  *lifecycle(): TGenerator<number[]> {
    while (this.isWaitingForActions()) {
      while (this.isWaitingForActions()) {
        const { data: event, playerIndex } = yield* this.race([
          this.waitForSocketEvent(EGameClientEvent.EXECUTE_ACTION),
          this.waitForSocketEvent(EGameClientEvent.CANCEL_ACTION),
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

  isWaitingForAction = (playerData: ITurnPlayerData): boolean => {
    return Boolean(playerData.waitingForAction && !playerData.chosenActionEvent);
  };

  isWaitingForActions(): boolean {
    return this.playersData.some(this.isWaitingForAction);
  }
}
