import random from 'lodash/random';

import { EGame } from 'common/types/game';
import {
  ECardActionType,
  EGameEvent,
  EGamePhase,
  EWaitingActionType,
  IExecuteActionEvent,
  ITurnPlayerData,
  TWaitingAction,
} from 'common/types/sevenWonders';
import { EBuildType } from 'app/client/pages/Game/components/SevenWondersGame/components/MainBoard/components/HandCard/types';

import GameEntity, { TGenerator } from 'server/gamesData/Game/utilities/GameEntity';
import getPlayerHandCards from 'app/common/utilities/sevenWonders/getPlayerHandCards';
import { getRandomIndex } from 'app/common/utilities/random';

import SevenWondersGame from 'server/gamesData/Game/SevenWondersGame/entities/SevenWondersGame';

export interface ITurnOptions {
  startingWaitingAction: Exclude<EWaitingActionType, EWaitingActionType.EFFECT_BUILD_CARD>;
  executeActions(playersData: ITurnPlayerData[]): number[] | void;
  getWaitingActions?(): (TWaitingAction | null)[];
}

interface IBotMoveResult {
  data: IExecuteActionEvent;
  playerIndex: number;
}

export default class Turn extends GameEntity<EGame.SEVEN_WONDERS, number[]> {
  game: SevenWondersGame;

  playersData: ITurnPlayerData[];
  getWaitingActions: ITurnOptions['getWaitingActions'];
  executeActions: ITurnOptions['executeActions'];

  constructor(game: SevenWondersGame, options: ITurnOptions) {
    super(game);

    this.game = game;
    this.playersData = this.players.map(() => ({
      receivedCoins: 0,
      chosenActionEvent: null,
      waitingForAction: {
        type: options.startingWaitingAction,
      },
    }));
    this.getWaitingActions = options.getWaitingActions;
    this.executeActions = options.executeActions;
  }

  *lifecycle() {
    while (this.isWaitingForActions()) {
      while (this.isWaitingForActions()) {
        const firstWaitingBotIndex = this.game.playersData.findIndex(
          ({ isBot }, index) => isBot && this.isWaitingForAction(this.playersData[index]),
        );

        const { data: event, playerIndex } = yield* this.race([
          this.waitForSocketEvent(EGameEvent.EXECUTE_ACTION),
          this.waitForSocketEvent(EGameEvent.CANCEL_ACTION),
          ...(firstWaitingBotIndex === -1 ? [] : [this.makeRandomMove(firstWaitingBotIndex)]),
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

  // FIXME: remove after bot api
  *makeRandomMove(playerIndex: number): TGenerator<IBotMoveResult> {
    yield* this.delay(random(200, 1000, true));

    const { waitingForAction } = this.playersData[playerIndex];

    const hand = getPlayerHandCards({
      waitingForAction,
      buildCardEffects:
        this.game.phase?.type === EGamePhase.AGE ? this.game.phase.age.playersData[playerIndex].buildEffects : [],
      gamePhase: this.game.phase?.type ?? null,
      agePhase: this.game.phase?.type === EGamePhase.AGE ? this.game.phase.age.phase : null,
      leadersPool:
        this.game.phase?.type === EGamePhase.DRAFT_LEADERS
          ? this.game.phase.leadersDraft.playersData[playerIndex].leadersPool
          : [],
      leadersHand: this.game.playersData[playerIndex].leadersHand,
      hand: this.game.phase?.type === EGamePhase.AGE ? this.game.phase.age.playersData[playerIndex].hand : [],
      discard: this.game.discard,
    });

    return {
      data: {
        cardIndex: getRandomIndex(hand.length),
        action:
          this.game.phase?.type === EGamePhase.DRAFT_LEADERS
            ? {
                type: ECardActionType.PICK_LEADER,
              }
            : {
                type: ECardActionType.BUILD_STRUCTURE,
                freeBuildType: {
                  type: EBuildType.FREE_BY_BUILDING,
                },
              },
      },
      playerIndex,
    };
  }
}
