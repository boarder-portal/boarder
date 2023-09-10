import random from 'lodash/random';

import { BuildKind } from 'client/pages/Game/components/SevenWondersGame/components/MainBoard/components/HandCard/types';
import { GameType } from 'common/types/game';
import { CardActionType, GameClientEventType, GamePhaseType, Player } from 'common/types/sevenWonders';

import { getRandomIndex } from 'common/utilities/random';
import getPlayerHandCards from 'common/utilities/sevenWonders/getPlayerHandCards';
import BotEntity from 'server/gamesData/Game/utilities/BotEntity';
import { EntityGenerator } from 'server/gamesData/Game/utilities/Entity';

export default class SevenWondersBot extends BotEntity<GameType.SEVEN_WONDERS> {
  *lifecycle(): EntityGenerator {
    this.sendSocketEvent(GameClientEventType.PICK_CITY_SIDE, random(0, 1));

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
        agePhase: phase?.type === GamePhaseType.AGE ? phase.phase : null,
      });

      yield* this.delay(random(200, 1000, true));

      this.sendSocketEvent(GameClientEventType.EXECUTE_ACTION, {
        cardIndex: getRandomIndex(hand.length),
        action:
          phase?.type === GamePhaseType.DRAFT_LEADERS
            ? {
                type: CardActionType.PICK_LEADER,
              }
            : {
                type: CardActionType.BUILD_STRUCTURE,
                freeBuildType: {
                  type: BuildKind.FREE_BY_BUILDING,
                },
              },
      });

      yield* this.refreshGameInfo();
    }
  }

  getPlayer(): Player {
    return this.getGameInfo().players[this.playerIndex];
  }

  *waitForWaitingAction(): EntityGenerator {
    while (true) {
      const turnData = this.getPlayer().data.turn;

      if (turnData?.waitingForAction && !turnData.chosenActionEvent) {
        return;
      }

      yield* this.refreshGameInfo();
    }
  }
}
