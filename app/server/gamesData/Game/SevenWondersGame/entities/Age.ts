import chunk from 'lodash/chunk';
import shuffle from 'lodash/shuffle';

import { CARDS_BY_AGE } from 'common/constants/games/sevenWonders';

import { BuildKind } from 'client/components/games/sevenWonders/SevenWondersGame/components/SevenWondersGameContent/components/MainBoard/components/HandCard/types';
import { GameType } from 'common/types/game';
import {
  Age as AgeModel,
  AgePhaseType,
  AgePlayerData,
  CardActionType,
  ExecuteActionEvent,
  NeighborSide,
  TurnPlayerData,
  WaitingAction,
  WaitingActionType,
} from 'common/types/games/sevenWonders';
import { Card, CardType } from 'common/types/games/sevenWonders/cards';
import { Effect, FreeCardPeriodType, FreeCardSourceType } from 'common/types/games/sevenWonders/effects';

import { EntityGenerator } from 'common/utilities/Entity/Entity';
import getPlayerHandCards from 'common/utilities/games/sevenWonders/getPlayerHandCards';
import { getWaitingBuildEffect } from 'common/utilities/games/sevenWonders/getWaitingBuildEffect';
import {
  isBuildCardEffect,
  isCommercialCardsPassiveEffect,
  isDrawLeadersEffect,
  isReturnDefeatsEffect,
  isStructureInheritancePassiveEffect,
  isVictoryTokensCoinPassiveEffect,
} from 'common/utilities/games/sevenWonders/isEffect';
import rotateObjects from 'common/utilities/rotateObjects';
import ServerEntity from 'server/gamesData/Game/utilities/ServerEntity';

import SevenWondersGame from 'server/gamesData/Game/SevenWondersGame/SevenWondersGame';
import Turn from 'server/gamesData/Game/SevenWondersGame/entities/Turn';

export interface AgeOptions {
  age: number;
}

export default class Age extends ServerEntity<GameType.SEVEN_WONDERS> {
  game: SevenWondersGame;

  age: number;
  phase = AgePhaseType.RECRUIT_LEADERS;
  playersData: AgePlayerData[] = this.getPlayersData(() => ({
    hand: [],
    buildEffects: [],
  }));

  turn: Turn | null = null;

  constructor(game: SevenWondersGame, options: AgeOptions) {
    super(game);

    this.game = game;
    this.age = options.age;
  }

  *lifecycle(): EntityGenerator {
    const { includeLeaders } = this.options;

    this.forEachPlayer((playerIndex) => {
      this.playersData[playerIndex].buildEffects = this.game
        .getAllPlayerEffects(playerIndex)
        .filter(isBuildCardEffect)
        .filter((effect) => effect.period !== FreeCardPeriodType.NOW);
    });

    if (includeLeaders) {
      this.turn = new Turn(this.game, {
        startingWaitingAction: WaitingActionType.RECRUIT_LEADER,
        executeActions: this.executePlayersActions,
        getWaitingActions: this.getWaitingActions,
      });

      this.game.sendGameInfo();

      this.withdrawPlayersCoins(yield* this.waitForEntity(this.turn));
    }

    this.game.sendGameInfo();

    this.phase = AgePhaseType.BUILD_STRUCTURES;

    this.playersData.forEach((playerData) => {
      playerData.buildEffects = playerData.buildEffects.filter(
        ({ period }) => period !== FreeCardPeriodType.LEADER_RECRUITMENT,
      );
    });

    let ageCards = CARDS_BY_AGE[this.age];

    if (!includeLeaders) {
      ageCards = ageCards.filter(({ fromLeadersExtension }) => !fromLeadersExtension);
    }

    const addedGuildCards = shuffle(ageCards.filter(({ type }) => type === CardType.GUILD)).slice(
      0,
      this.playersCount + 2,
    );
    const usedCards = ageCards.reduce<Card[]>((cards, card) => {
      return card.minPlayersCounts.reduce((cards, cardPlayersCount) => {
        if (cardPlayersCount > this.playersCount) {
          return cards;
        }

        return [...cards, card];
      }, cards);
    }, addedGuildCards);

    const shuffledCards = chunk(shuffle(usedCards), usedCards.length / this.playersCount);

    this.forEachPlayer((playerIndex) => {
      this.playersData[playerIndex].hand = shuffledCards[playerIndex];
    });

    while (!this.isLastTurn()) {
      this.turn = new Turn(this.game, {
        startingWaitingAction: WaitingActionType.BUILD_CARD,
        executeActions: this.executePlayersActions,
        getWaitingActions: this.getWaitingActions,
      });

      this.game.sendGameInfo();

      this.withdrawPlayersCoins(yield* this.waitForEntity(this.turn));

      const newHands = rotateObjects(
        this.playersData.map(({ hand }) => hand),
        this.game.getAgeDirection(this.age),
      );

      this.playersData.forEach((playerData, index) => {
        playerData.hand = newHands[index];
      });

      this.game.sendGameInfo();
    }

    const ageVictoryPoints = 2 * this.age + 1;

    this.forEachPlayer((playerIndex) => {
      const effects = this.game.getAllPlayerEffects(playerIndex);
      const playerShieldsCount = this.game.getPlayerShieldsCount(playerIndex);

      [
        this.game.getNeighbor(playerIndex, NeighborSide.LEFT),
        this.game.getNeighbor(playerIndex, NeighborSide.RIGHT),
      ].forEach((neighbor) => {
        const neighborShieldsCount = this.game.getPlayerShieldsCount(neighbor);

        if (playerShieldsCount > neighborShieldsCount) {
          this.game.addVictoryToken(playerIndex, ageVictoryPoints);

          effects.filter(isVictoryTokensCoinPassiveEffect).forEach((effect) => {
            this.game.changePlayerCoins(playerIndex, effect.count);
          });
        } else if (playerShieldsCount < neighborShieldsCount) {
          this.game.addDefeatToken(effects.some(isReturnDefeatsEffect) ? neighbor : playerIndex);
        }
      });
    });

    this.turn = null;
  }

  executePlayerAction(
    playerIndex: number,
    executeActionEvent: ExecuteActionEvent,
    waitingForAction: WaitingAction,
    receivedCoins: number[],
  ): Effect[] {
    const { cardIndex, action, payments } = executeActionEvent;

    if (action.type === CardActionType.PICK_LEADER) {
      return [];
    }

    const { hand, buildEffects } = this.playersData[playerIndex];

    const playerHandCards = getPlayerHandCards({
      waitingForAction,
      buildCardEffects: buildEffects,
      gamePhase: this.game.phase?.type ?? null,
      agePhase: this.phase,
      leadersPool: [],
      leadersHand: this.game.playersData[playerIndex].leadersHand,
      hand,
      discard: this.game.discard,
    });
    const card = playerHandCards[cardIndex];
    const waitingBuildEffect = getWaitingBuildEffect(waitingForAction, buildEffects);
    const newEffects: Effect[] = [];

    if (action.type === CardActionType.BUILD_STRUCTURE) {
      this.game.buildCard(playerIndex, card);

      if (!action.freeBuildType && !waitingBuildEffect?.isFree) {
        this.game.changePlayerCoins(playerIndex, -Math.max(0, (card.price?.coins ?? 0) - (action.discount ?? 0)));
      }

      if (action.freeBuildType?.type === BuildKind.FREE_WITH_EFFECT) {
        this.usePlayerBuildEffect(playerIndex, action.freeBuildType.effectIndex);
      }

      newEffects.push(...card.effects);

      const effects = this.game.getAllPlayerEffects(playerIndex);

      if (card.type === CardType.COMMERCIAL) {
        effects.filter(isCommercialCardsPassiveEffect).forEach((effect) => {
          this.game.changePlayerCoins(playerIndex, effect.count);
        });
      }

      if (action.freeBuildType?.type === BuildKind.FREE_BY_BUILDING) {
        effects.filter(isStructureInheritancePassiveEffect).forEach((effect) => {
          this.game.changePlayerCoins(playerIndex, effect.count);
        });
      }

      if (action.copiedCard) {
        this.game.copyCard(playerIndex, action.copiedCard);

        newEffects.push(...action.copiedCard.effects);
      }
    } else if (action.type === CardActionType.BUILD_WONDER_STAGE) {
      const city = this.game.getPlayerCity(playerIndex);
      const wonderLevel = city.wonders[action.stageIndex];

      this.game.buildWonderStage(playerIndex, {
        index: action.stageIndex,
        card,
        cardType: card.type === CardType.LEADER ? 'leader' : this.age,
      });
      this.game.changePlayerCoins(playerIndex, -(wonderLevel.price.coins ?? 0));

      newEffects.push(...wonderLevel.effects);
    } else if (action.type === CardActionType.DISCARD) {
      this.game.changePlayerCoins(playerIndex, 3);

      if (card.type !== CardType.LEADER) {
        this.game.discardCards([card]);
      }
    }

    playerHandCards.splice(cardIndex, 1);

    if (waitingForAction.type === WaitingActionType.EFFECT_BUILD_CARD) {
      this.usePlayerBuildEffect(playerIndex, waitingForAction.buildEffectIndex);
    }

    if (payments) {
      (Object.entries(payments) as [NeighborSide, number][]).forEach(([neighborSide, payment]) => {
        const neighbor = this.game.getNeighbor(playerIndex, neighborSide);

        receivedCoins[neighbor] += payment;

        this.game.changePlayerCoins(playerIndex, -payment);
      });
    }

    newEffects.forEach((effect) => {
      if (isBuildCardEffect(effect)) {
        buildEffects.push(effect);
      } else if (isDrawLeadersEffect(effect)) {
        this.game.addLeaders(playerIndex, effect.count);
      }
    });

    return newEffects;
  }

  executePlayersActions = (playersData: TurnPlayerData[]): number[] => {
    const receivedCoins = this.getPlayersData(() => 0);
    const newPlayersEffects: {
      playerIndex: number;
      effects: Effect[];
    }[] = [];

    playersData.forEach(({ chosenActionEvent, waitingForAction }, index) => {
      if (chosenActionEvent && waitingForAction) {
        newPlayersEffects.push({
          playerIndex: index,
          effects: this.executePlayerAction(index, chosenActionEvent, waitingForAction, receivedCoins),
        });
      }
    });

    newPlayersEffects.forEach(({ playerIndex, effects }) => {
      effects.forEach((effect) => {
        this.game.changePlayerCoins(playerIndex, this.game.calculateEffectGain(effect, playerIndex)?.coins ?? 0);
      });
    });

    return receivedCoins;
  };

  getWaitingActions = (): (WaitingAction | null)[] => {
    const isLastTurn = this.isLastTurn();
    const waitingActions: (WaitingAction | null)[] = this.getPlayersData(() => null);
    let someoneBuildsLastCard = false;

    if (isLastTurn) {
      this.playersData.forEach(({ buildEffects }, index) => {
        const buildLastCardEffectIndex = buildEffects.findIndex(
          (effect) => effect.period === FreeCardPeriodType.LAST_AGE_TURN,
        );

        if (buildLastCardEffectIndex !== -1) {
          waitingActions[index] = {
            type: WaitingActionType.EFFECT_BUILD_CARD,
            buildEffectIndex: buildLastCardEffectIndex,
          };

          someoneBuildsLastCard = true;
        }
      });
    }

    this.playersData.forEach(({ buildEffects }, index) => {
      const buildNowEffectIndex = buildEffects.findIndex(
        (effect) => effect.period === FreeCardPeriodType.NOW && effect.source !== FreeCardSourceType.DISCARD,
      );

      if (buildNowEffectIndex !== -1) {
        waitingActions[index] = {
          type: WaitingActionType.EFFECT_BUILD_CARD,
          buildEffectIndex: buildNowEffectIndex,
        };
      }
    });

    if (someoneBuildsLastCard) {
      return waitingActions;
    }

    if (isLastTurn) {
      this.playersData.forEach(({ hand }) => {
        this.game.discardCards(hand.splice(0));
      });
    }

    if (this.game.discard.length > 0) {
      let maxDiscardPriority = -Infinity;
      let highestDiscardTarget:
        | {
            playerIndex: number;
            effectIndex: number;
          }
        | undefined;

      this.playersData.forEach(({ buildEffects }, index) => {
        const buildFromDiscardEffectIndex = buildEffects.findIndex(
          (effect) => effect.period === FreeCardPeriodType.NOW && effect.source === FreeCardSourceType.DISCARD,
        );

        if (buildFromDiscardEffectIndex !== -1) {
          const priority = buildEffects[buildFromDiscardEffectIndex].priority ?? -1;

          if (priority > maxDiscardPriority) {
            highestDiscardTarget = {
              playerIndex: index,
              effectIndex: buildFromDiscardEffectIndex,
            };
            maxDiscardPriority = priority;
          }
        }
      });

      if (highestDiscardTarget) {
        waitingActions[highestDiscardTarget.playerIndex] = {
          type: WaitingActionType.EFFECT_BUILD_CARD,
          buildEffectIndex: highestDiscardTarget.effectIndex,
        };
      }
    }

    return waitingActions;
  };

  isLastTurn(): boolean {
    return this.phase === AgePhaseType.BUILD_STRUCTURES && this.playersData.some(({ hand }) => hand.length <= 1);
  }

  toJSON(): AgeModel {
    return {
      age: this.age,
      phase: this.phase,
    };
  }

  usePlayerBuildEffect(playerIndex: number, effectIndex: number): void {
    const buildEffect = this.playersData[playerIndex].buildEffects[effectIndex];

    if (buildEffect.period !== FreeCardPeriodType.ETERNITY) {
      this.playersData[playerIndex].buildEffects.splice(effectIndex, 1);
    }
  }

  withdrawPlayersCoins(receivedCoins: number[]): void {
    this.forEachPlayer((playerIndex) => {
      this.game.changePlayerCoins(playerIndex, receivedCoins[playerIndex]);
    });
  }
}
