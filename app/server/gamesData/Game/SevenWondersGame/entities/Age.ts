import shuffle from 'lodash/shuffle';
import chunk from 'lodash/chunk';

import { CARDS_BY_AGE } from 'common/constants/games/sevenWonders';

import { EGame } from 'common/types/game';
import {
  EAgePhase,
  ECardActionType,
  ENeighborSide,
  EWaitingActionType,
  IAge,
  IAgePlayerData,
  IExecuteActionEvent,
  ITurnPlayerData,
  TWaitingAction,
} from 'common/types/sevenWonders';
import { EFreeCardPeriod, EFreeCardSource, TEffect } from 'common/types/sevenWonders/effects';
import { EBuildType } from 'client/pages/Game/components/SevenWondersGame/components/MainBoard/components/HandCard/types';
import { ECardType, ICard } from 'common/types/sevenWonders/cards';

import getPlayerHandCards from 'common/utilities/sevenWonders/getPlayerHandCards';
import { getWaitingBuildEffect } from 'common/utilities/sevenWonders/getWaitingBuildEffect';
import Entity, { TGenerator } from 'server/gamesData/Game/utilities/Entity';
import {
  isBuildCardEffect,
  isCommercialCardsPassiveEffect,
  isDrawLeadersEffect,
  isReturnDefeatsEffect,
  isStructureInheritancePassiveEffect,
  isVictoryTokensCoinPassiveEffect,
} from 'common/utilities/sevenWonders/isEffect';
import rotateObjects from 'common/utilities/rotateObjects';

import Turn from 'server/gamesData/Game/SevenWondersGame/entities/Turn';
import SevenWondersGame from 'server/gamesData/Game/SevenWondersGame/SevenWondersGame';

export interface IAgeOptions {
  age: number;
}

export default class Age extends Entity<EGame.SEVEN_WONDERS> {
  game: SevenWondersGame;

  age: number;
  phase = EAgePhase.RECRUIT_LEADERS;
  playersData: IAgePlayerData[];

  turn: Turn | null = null;

  constructor(game: SevenWondersGame, options: IAgeOptions) {
    super(game);

    this.game = game;
    this.age = options.age;
    this.playersData = this.getPlayersData(() => ({
      hand: [],
      buildEffects: [],
    }));
  }

  *lifecycle(): TGenerator {
    this.forEachPlayer((playerIndex) => {
      this.playersData[playerIndex].buildEffects = this.game
        .getAllPlayerEffects(playerIndex)
        .filter(isBuildCardEffect)
        .filter((effect) => effect.period !== EFreeCardPeriod.NOW);
    });

    this.turn = this.spawnEntity(
      new Turn(this.game, {
        startingWaitingAction: EWaitingActionType.RECRUIT_LEADER,
        executeActions: this.executePlayersActions,
        getWaitingActions: this.getWaitingActions,
      }),
    );

    this.game.sendGameInfo();

    this.withdrawPlayersCoins(yield* this.turn);

    this.game.sendGameInfo();

    this.phase = EAgePhase.BUILD_STRUCTURES;

    this.playersData.forEach((playerData) => {
      playerData.buildEffects = playerData.buildEffects.filter(
        ({ period }) => period !== EFreeCardPeriod.LEADER_RECRUITMENT,
      );
    });

    const ageCards = CARDS_BY_AGE[this.age];
    const addedGuildCards = shuffle(ageCards.filter(({ type }) => type === ECardType.GUILD)).slice(
      0,
      this.playersCount + 2,
    );
    const usedCards = ageCards.reduce<ICard[]>((cards, card) => {
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
      this.turn = this.spawnEntity(
        new Turn(this.game, {
          startingWaitingAction: EWaitingActionType.BUILD_CARD,
          executeActions: this.executePlayersActions,
          getWaitingActions: this.getWaitingActions,
        }),
      );

      this.game.sendGameInfo();

      this.withdrawPlayersCoins(yield* this.turn);

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
        this.game.getNeighbor(playerIndex, ENeighborSide.LEFT),
        this.game.getNeighbor(playerIndex, ENeighborSide.RIGHT),
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
  }

  executePlayerAction(
    playerIndex: number,
    executeActionEvent: IExecuteActionEvent,
    waitingForAction: TWaitingAction,
    receivedCoins: number[],
  ): TEffect[] {
    const { cardIndex, action, payments } = executeActionEvent;

    if (action.type === ECardActionType.PICK_LEADER) {
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
    const newEffects: TEffect[] = [];

    if (action.type === ECardActionType.BUILD_STRUCTURE) {
      this.game.buildCard(playerIndex, card);

      if (!action.freeBuildType && !waitingBuildEffect?.isFree) {
        this.game.changePlayerCoins(playerIndex, -Math.max(0, (card.price?.coins ?? 0) - (action.discount ?? 0)));
      }

      if (action.freeBuildType?.type === EBuildType.FREE_WITH_EFFECT) {
        this.usePlayerBuildEffect(playerIndex, action.freeBuildType.effectIndex);
      }

      newEffects.push(...card.effects);

      const effects = this.game.getAllPlayerEffects(playerIndex);

      if (card.type === ECardType.COMMERCIAL) {
        effects.filter(isCommercialCardsPassiveEffect).forEach((effect) => {
          this.game.changePlayerCoins(playerIndex, effect.count);
        });
      }

      if (action.freeBuildType?.type === EBuildType.FREE_BY_BUILDING) {
        effects.filter(isStructureInheritancePassiveEffect).forEach((effect) => {
          this.game.changePlayerCoins(playerIndex, effect.count);
        });
      }

      if (action.copiedCard) {
        this.game.copyCard(playerIndex, action.copiedCard);

        newEffects.push(...action.copiedCard.effects);
      }
    } else if (action.type === ECardActionType.BUILD_WONDER_STAGE) {
      const city = this.game.getPlayerCity(playerIndex);
      const wonderLevel = city.wonders[action.stageIndex];

      this.game.buildWonderStage(playerIndex, {
        index: action.stageIndex,
        card,
        cardType: card.type === ECardType.LEADER ? 'leader' : this.age,
      });
      this.game.changePlayerCoins(playerIndex, -(wonderLevel.price.coins ?? 0));

      newEffects.push(...wonderLevel.effects);
    } else if (action.type === ECardActionType.DISCARD) {
      this.game.changePlayerCoins(playerIndex, 3);

      if (card.type !== ECardType.LEADER) {
        this.game.discardCards([card]);
      }
    }

    playerHandCards.splice(cardIndex, 1);

    if (waitingForAction.type === EWaitingActionType.EFFECT_BUILD_CARD) {
      this.usePlayerBuildEffect(playerIndex, waitingForAction.buildEffectIndex);
    }

    if (payments) {
      (Object.entries(payments) as [ENeighborSide, number][]).forEach(([neighborSide, payment]) => {
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

  executePlayersActions = (playersData: ITurnPlayerData[]): number[] => {
    const receivedCoins = this.getPlayersData(() => 0);
    const newPlayersEffects: {
      playerIndex: number;
      effects: TEffect[];
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

  getWaitingActions = (): (TWaitingAction | null)[] => {
    const isLastTurn = this.isLastTurn();
    const waitingActions: (TWaitingAction | null)[] = this.getPlayersData(() => null);
    let someoneBuildsLastCard = false;

    if (isLastTurn) {
      this.playersData.forEach(({ buildEffects }, index) => {
        const buildLastCardEffectIndex = buildEffects.findIndex(
          (effect) => effect.period === EFreeCardPeriod.LAST_AGE_TURN,
        );

        if (buildLastCardEffectIndex !== -1) {
          waitingActions[index] = {
            type: EWaitingActionType.EFFECT_BUILD_CARD,
            buildEffectIndex: buildLastCardEffectIndex,
          };

          someoneBuildsLastCard = true;
        }
      });
    }

    this.playersData.forEach(({ buildEffects }, index) => {
      const buildNowEffectIndex = buildEffects.findIndex(
        (effect) => effect.period === EFreeCardPeriod.NOW && effect.source !== EFreeCardSource.DISCARD,
      );

      if (buildNowEffectIndex !== -1) {
        waitingActions[index] = {
          type: EWaitingActionType.EFFECT_BUILD_CARD,
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
          (effect) => effect.period === EFreeCardPeriod.NOW && effect.source === EFreeCardSource.DISCARD,
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
          type: EWaitingActionType.EFFECT_BUILD_CARD,
          buildEffectIndex: highestDiscardTarget.effectIndex,
        };
      }
    }

    return waitingActions;
  };

  isLastTurn(): boolean {
    return this.playersData.some(({ hand }) => hand.length <= 1);
  }

  toJSON(): IAge {
    return {
      age: this.age,
      phase: this.phase,
    };
  }

  usePlayerBuildEffect(playerIndex: number, effectIndex: number): void {
    this.playersData[playerIndex].buildEffects.splice(effectIndex, 1);
  }

  withdrawPlayersCoins(receivedCoins: number[]): void {
    this.forEachPlayer((playerIndex) => {
      this.game.changePlayerCoins(playerIndex, receivedCoins[playerIndex]);
    });
  }
}
