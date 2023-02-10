import random from 'lodash/random';

import { EGame } from 'common/types/game';
import { ECardActionType, EGameClientEvent, EGamePhase, IPlayer } from 'common/types/sevenWonders';
import { EBuildType } from 'client/pages/Game/components/SevenWondersGame/components/MainBoard/components/HandCard/types';

import BotEntity from 'server/gamesData/Game/utilities/BotEntity';
import { TGenerator } from 'server/gamesData/Game/utilities/Entity';
import getPlayerHandCards from 'common/utilities/sevenWonders/getPlayerHandCards';
import { getRandomIndex } from 'common/utilities/random';

export default class SevenWondersBot extends BotEntity<EGame.SEVEN_WONDERS> {
  *lifecycle(): TGenerator {
    this.sendSocketEvent(EGameClientEvent.PICK_CITY_SIDE, random(0, 1));

    while (true) {
      yield* this.waitForWaitingAction();

      const { discard, phase } = this.getGameInfo();
      const player = this.getPlayer();

      const hand = getPlayerHandCards({
        waitingForAction: player.data.turn?.waitingForAction,
        buildCardEffects: player.data.age?.buildEffects,
        leadersHand: player.data.leadersHand,
        leadersPool: player.data.leadersDraft?.leadersPool ?? [],
        hand: player.data.age?.hand ?? [],
        discard,
        gamePhase: phase?.type ?? null,
        agePhase: phase?.type === EGamePhase.AGE ? phase.phase : null,
      });

      yield* this.delay(random(200, 1000, true));

      this.sendSocketEvent(EGameClientEvent.EXECUTE_ACTION, {
        cardIndex: getRandomIndex(hand.length),
        action:
          phase?.type === EGamePhase.DRAFT_LEADERS
            ? {
                type: ECardActionType.PICK_LEADER,
              }
            : {
                type: ECardActionType.BUILD_STRUCTURE,
                freeBuildType: {
                  type: EBuildType.FREE_BY_BUILDING,
                },
              },
      });

      yield* this.refreshGameInfo();
    }
  }

  getPlayer(): IPlayer {
    return this.getGameInfo().players[this.playerIndex];
  }

  *waitForWaitingAction(): TGenerator {
    while (true) {
      const turnData = this.getPlayer().data.turn;

      if (turnData?.waitingForAction && !turnData.chosenActionEvent) {
        return;
      }

      yield* this.refreshGameInfo();
    }
  }
}
