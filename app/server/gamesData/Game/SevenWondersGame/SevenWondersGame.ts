import shuffle from 'lodash/shuffle';
import chunk from 'lodash/chunk';
import times from 'lodash/times';
import random from 'lodash/random';

import { GAMES_CONFIG } from 'common/constants/gamesConfig';

import { IGameEvent } from 'server/types';
import { EGame } from 'common/types/game';
import { EPlayerStatus, IPlayer } from 'common/types';
import {
  ESevenWondersCardActionType,
  ESevenWondersCity,
  ESevenWondersGameEvent,
  ESevenWondersGamePhase,
  ESevenWondersNeighborSide,
  ESevenWondersScientificSymbol,
  ESevenWondersWaitingActionType,
  ISevenWondersExecuteActionEvent,
  ISevenWondersGameInfoEvent,
  ISevenWondersPlayer,
} from 'common/types/sevenWonders';
import {
  ESevenWonderCardId,
  ESevenWondersCardType,
  ESevenWondersPlayerDirection,
  ISevenWondersCard,
} from 'common/types/sevenWonders/cards';
import {
  ESevenWondersEffect,
  ESevenWondersFreeCardPeriod,
  ESevenWondersFreeCardSource,
  ISevenWondersGain,
  ISevenWondersScientificSetEffect,
  ISevenWondersScientificSymbolsEffect,
  TSevenWondersEffect,
} from 'common/types/sevenWonders/effects';
import {
  EBuildType,
} from 'client/pages/Game/components/SevenWondersGame/components/MainBoard/components/HandCard/types';

import { getAllCombinations } from 'common/utilities/combinations';
import {
  isBuildCardEffect,
  isCommercialCardsPassiveEffect,
  isCopyEffect,
  isDrawLeadersEffect,
  isReturnDefeatsEffect,
  isScientificSetEffect,
  isScientificSymbolsEffect,
  isShieldsEffect,
  isStructureInheritancePassiveEffect,
  isVictoryTokensCoinPassiveEffect,
} from 'common/utilities/sevenWonders/isEffect';
import getNeighbor from 'common/utilities/sevenWonders/getNeighbor';
import getAllPlayerEffects from 'common/utilities/sevenWonders/getAllPlayerEffects';
import getCity from 'common/utilities/sevenWonders/getCity';
import getAgeDirection from 'common/utilities/sevenWonders/getAgeDirection';
import getPlayerHandCards from 'common/utilities/sevenWonders/getPlayerHandCards';
import getWaitingBuildEffect from 'common/utilities/sevenWonders/getWaitingBuildEffect';

import Game, { IGameCreateOptions } from 'server/gamesData/Game/Game';

const {
  games: {
    [EGame.SEVEN_WONDERS]: {
      cardsByAge,
      allLeaders,
    },
  },
} = GAMES_CONFIG;

const ALL_CITIES = Object.values(ESevenWondersCity);

class SevenWondersGame extends Game<EGame.SEVEN_WONDERS> {
  handlers = {
    [ESevenWondersGameEvent.GET_GAME_INFO]: this.onGetGameInfo,
    [ESevenWondersGameEvent.EXECUTE_ACTION]: this.onExecuteAction,
    [ESevenWondersGameEvent.CANCEL_ACTION]: this.onCancelAction,
  };

  age = -1;
  phase: ESevenWondersGamePhase = ESevenWondersGamePhase.DRAFT_LEADERS;
  discard: ISevenWondersCard[] = [];
  leadersDeck: ISevenWondersCard[] = [];

  constructor(options: IGameCreateOptions<EGame.SEVEN_WONDERS>) {
    super(options);

    this.createGameInfo();
  }

  createPlayer(roomPlayer: IPlayer): ISevenWondersPlayer {
    return {
      ...roomPlayer,
      points: 0,
      hand: [],
      builtCards: [],
      city: ESevenWondersCity.RHODOS,
      citySide: Number(Math.random() > 0.5),
      builtStages: [],
      coins: 6,
      receivedCoinsDuringTurn: 0,
      victoryPoints: [],
      defeatPoints: [],
      isBot: false,
      chosenActionEvent: null,
      waitingForAction: null,
      buildCardEffects: [],
      leadersHand: [],
      leadersPool: [],
      copiedCard: null,
    };
  }

  createGameInfo(): void {
    const shuffledCities = shuffle(ALL_CITIES);

    times(this.options.playersCount - this.players.length, (index) => {
      this.players.push({
        ...this.createPlayer({
          status: EPlayerStatus.DISCONNECTED,
          login: `bot-${index}`,
        }),
        isBot: true,
      });
    });

    this.leadersDeck = shuffle(allLeaders);

    this.players.forEach((player, playerIndex) => {
      player.city = shuffledCities[playerIndex];

      getAllPlayerEffects(player).forEach((effect) => {
        player.coins += this.calculateEffectGain(effect, player)?.coins ?? 0;
      });

      times(4, () => {
        const leader = this.leadersDeck.pop();

        if (leader) {
          player.leadersPool.push(leader);
        }
      });

      // if (!player.isBot) {
      //   player.city = ESevenWondersCity.HALIKARNASSOS;
      //   player.citySide = 1;
      //   player.leadersHand.push(...allLeaders.filter(({ id }) => id === ESevenWonderCardId.MAECENAS));
      // }

      // if (player.login === '123') {
      //   player.city = ESevenWondersCity.ROMA;
      //   player.citySide = 1;
      //   player.leadersHand.push(...allLeaders.filter(({ id }) => id === ESevenWonderCardId.SOLOMON));
      // }
      //
      // if (player.login === '234') {
      //   player.city = ESevenWondersCity.BABYLON;
      //   player.citySide = 1;
      // }
      //
      // if (player.login === '345') {
      //   player.city = ESevenWondersCity.HALIKARNASSOS;
      //   player.citySide = 1;
      // }
    });

    this.startTurn();
  }

  startAge(): void {
    this.age++;
    this.phase = ESevenWondersGamePhase.RECRUIT_LEADERS;

    const ageCards = cardsByAge[this.age];
    const addedGuildCards = shuffle(
      ageCards
        .filter(({ type }) => type === ESevenWondersCardType.GUILD)
        .slice(0, this.players.length + 2),
    );
    const usedCards = ageCards.reduce<ISevenWondersCard[]>((cards, card) => {
      return card.minPlayersCounts.reduce((cards, cardPlayersCount) => {
        if (cardPlayersCount > this.players.length) {
          return cards;
        }

        return [
          ...cards,
          card,
        ];
      }, cards);
    }, addedGuildCards);

    const shuffledCards = chunk(shuffle(usedCards), usedCards.length / this.players.length);

    this.players.forEach((player, index) => {
      player.hand = shuffledCards[index];

      getAllPlayerEffects(player).filter(isBuildCardEffect).forEach((effect) => {
        if (
          effect.period === ESevenWondersFreeCardPeriod.AGE
          || effect.period === ESevenWondersFreeCardPeriod.LAST_AGE_TURN
          || effect.period === ESevenWondersFreeCardPeriod.LEADER_RECRUITMENT
        ) {
          player.buildCardEffects.push(effect);
        }
      });
    });

    this.startTurn();
  }

  startTurn(): void {
    this.players.forEach((player) => {
      player.waitingForAction = {
        type: this.phase === ESevenWondersGamePhase.DRAFT_LEADERS
          ? ESevenWondersWaitingActionType.PICK_LEADER
          : this.phase === ESevenWondersGamePhase.RECRUIT_LEADERS
            ? ESevenWondersWaitingActionType.RECRUIT_LEADER
            : ESevenWondersWaitingActionType.BUILD_CARD,
      };

      if (player.isBot) {
        setTimeout(() => {
          player.hand = shuffle(player.hand);
          player.leadersHand = shuffle(player.leadersHand);
          player.leadersPool = shuffle(player.leadersPool);

          this.onPlayerExecuteAction(player, {
            cardIndex: 0,
            action: this.phase === ESevenWondersGamePhase.DRAFT_LEADERS ? {
              type: ESevenWondersCardActionType.PICK_LEADER,
            } : {
              type: ESevenWondersCardActionType.BUILD_STRUCTURE,
              freeBuildType: {
                type: EBuildType.FREE_BY_BUILDING,
              },
            },
          });
        }, random(200, 1000, true));
      }
    });
  }

  tryToEndTurn(): void {
    if (!this.isWaitingForActions()) {
      this.endTurn();
    }

    this.sendGameInfo();
  }

  endTurn(): void {
    if (this.phase === ESevenWondersGamePhase.DRAFT_LEADERS) {
      const leadersPools = this.players.map(({ leadersPool }) => leadersPool);
      const isLastPhaseTurn = leadersPools.some((pool) => pool.length === 1);

      this.players.forEach((player, playerIndex) => {
        const neighbor = this.getNeighbor(player, ESevenWondersNeighborSide.RIGHT);

        neighbor.leadersPool = leadersPools[playerIndex];

        if (isLastPhaseTurn) {
          neighbor.leadersHand.push(...neighbor.leadersPool);

          neighbor.leadersPool = [];
        }
      });

      if (isLastPhaseTurn) {
        this.startAge();
      } else {
        this.startTurn();
      }
    } else if (this.phase === ESevenWondersGamePhase.RECRUIT_LEADERS) {
      this.phase = ESevenWondersGamePhase.BUILD_STRUCTURES;

      this.players.forEach((player) => {
        player.buildCardEffects = player.buildCardEffects.filter(({ period }) => (
          period !== ESevenWondersFreeCardPeriod.LEADER_RECRUITMENT
        ));
      });

      this.withdrawPlayersCoins();
      this.startTurn();
    } else {
      const hands = this.players.map(({ hand }) => hand);
      const ageDirection = getAgeDirection(this.age);

      this.players.forEach((player, playerIndex) => {
        const neighbor = this.getNeighbor(player, ageDirection);

        neighbor.hand = hands[playerIndex];
      });

      this.withdrawPlayersCoins();

      if (this.isLastAgeTurn()) {
        this.endAge();
      } else {
        this.startTurn();
      }
    }
  }

  endAge(): void {
    const ageVictoryPoints = 2 * this.age + 1;

    this.players.forEach((player) => {
      const effects = getAllPlayerEffects(player);
      const playerShieldsCount = this.getPlayerShieldsCount(player);

      [
        this.getNeighbor(player, ESevenWondersNeighborSide.LEFT),
        this.getNeighbor(player, ESevenWondersNeighborSide.RIGHT),
      ].forEach((neighbor) => {
        const neighborShieldsCount = this.getPlayerShieldsCount(neighbor);

        if (playerShieldsCount > neighborShieldsCount) {
          player.victoryPoints.push(ageVictoryPoints);

          effects.filter(isVictoryTokensCoinPassiveEffect).forEach((effect) => {
            player.coins += effect.count;
          });
        } else if (playerShieldsCount < neighborShieldsCount) {
          const defeatTokenTarget = effects.some(isReturnDefeatsEffect)
            ? neighbor
            : player;

          defeatTokenTarget.defeatPoints.push(-1);
        }
      });

      player.buildCardEffects = player.buildCardEffects.filter(({ period }) => (
        period === ESevenWondersFreeCardPeriod.ETERNITY
      ));
    });

    if (this.age === 2) {
      this.endGame();
    } else {
      this.startAge();
    }
  }

  endGame(): void {
    this.players.forEach((player) => {
      player.points = this.calculatePlayerMaxPoints(player);
    });
  }

  isLastAgeTurn(): boolean {
    return this.players.some(({ hand }) => hand.length <= 1);
  }

  isWaitingForActions(): boolean {
    return this.players.some(({ chosenActionEvent, waitingForAction }) => {
      return waitingForAction && !chosenActionEvent;
    });
  }

  getNeighbor(player: ISevenWondersPlayer, neighborSide: ESevenWondersNeighborSide): ISevenWondersPlayer {
    return getNeighbor(this.players, player, neighborSide);
  }

  getDirectionsPlayers(
    player: ISevenWondersPlayer,
    directions: ESevenWondersPlayerDirection[],
  ): ISevenWondersPlayer[] {
    if (directions.includes(ESevenWondersPlayerDirection.ALL)) {
      return this.players;
    }

    return directions.reduce<ISevenWondersPlayer[]>((players, direction) => {
      let addedPlayer: ISevenWondersPlayer | undefined;

      if (direction === ESevenWondersPlayerDirection.SELF) {
        addedPlayer = player;
      } else if (direction === ESevenWondersPlayerDirection.LEFT) {
        addedPlayer = this.getNeighbor(player, ESevenWondersNeighborSide.LEFT);
      } else if (direction === ESevenWondersPlayerDirection.RIGHT) {
        addedPlayer = this.getNeighbor(player, ESevenWondersNeighborSide.RIGHT);
      }

      return addedPlayer
        ? [...players, addedPlayer]
        : players;
    }, []);
  }

  getPlayerTypeCards(player: ISevenWondersPlayer, cardType: ESevenWondersCardType): ISevenWondersCard[] {
    return player.builtCards.filter((card) => card.type === cardType);
  }

  getPlayerShieldsCount(player: ISevenWondersPlayer): number {
    return getAllPlayerEffects(player)
      .filter(isShieldsEffect)
      .reduce((shieldsCount, effect) => {
        return shieldsCount + effect.count;
      }, 0);
  }

  mergeGains(target: ISevenWondersGain, source: ISevenWondersGain, coefficient: number): ISevenWondersGain {
    if (source.points) {
      target.points = (target.points ?? 0) + source.points * coefficient;
    }

    if (source.coins) {
      target.coins = (target.coins ?? 0) + source.coins * coefficient;
    }

    return target;
  }

  calculateEffectGain(effect: TSevenWondersEffect, player: ISevenWondersPlayer): ISevenWondersGain | null {
    switch (effect.type) {
      case ESevenWondersEffect.GAIN: {
        return effect.gain;
      }

      case ESevenWondersEffect.CARDS_TYPE: {
        const gain: ISevenWondersGain = {};

        this.getDirectionsPlayers(player, effect.directions).forEach((player) => {
          const cardTypeCardCounts = effect.cardTypes.map((cardType) => {
            return this.getPlayerTypeCards(player, cardType).length;
          });
          const setsCount = Math.min(...cardTypeCardCounts);

          this.mergeGains(gain, effect.gain, setsCount);
        });

        return gain;
      }

      case ESevenWondersEffect.WONDER_LEVELS: {
        const gain: ISevenWondersGain = {};

        this.getDirectionsPlayers(player, effect.directions).forEach((player) => {
          this.mergeGains(gain, effect.gain, player.builtStages.length);
        });

        return gain;
      }

      case ESevenWondersEffect.WINS: {
        const gain: ISevenWondersGain = {};

        this.getDirectionsPlayers(player, effect.directions).forEach((player) => {
          this.mergeGains(gain, effect.gain, player.victoryPoints.length);
        });

        return gain;
      }

      case ESevenWondersEffect.LOSSES: {
        const gain: ISevenWondersGain = {};

        this.getDirectionsPlayers(player, effect.directions).forEach((player) => {
          this.mergeGains(gain, effect.gain, player.defeatPoints.length);
        });

        return gain;
      }

      case ESevenWondersEffect.GAIN_BY_COINS: {
        return this.mergeGains({}, effect.gain, Math.floor(player.coins / effect.count));
      }

      default: {
        return null;
      }
    }
  }

  calculateScientificEffectsMaxPoints(
    effects: ISevenWondersScientificSymbolsEffect[],
    setsEffects: ISevenWondersScientificSetEffect[],
  ): number {
    const symbols = effects.map((effect) => effect.variants);
    const symbolsCombinations = getAllCombinations(symbols);
    const setValue = setsEffects.reduce((setValue, setEffect) => {
      return setValue + (setEffect.gain.points ?? 0);
    }, 7);

    return symbolsCombinations.reduce((maxPoints, symbols) => {
      return Math.max(maxPoints, this.calculateScientificCardsPoints(symbols, setValue));
    }, 0);
  }

  calculateScientificCardsPoints(symbols: ESevenWondersScientificSymbol[], setValue: number): number {
    const symbolsCounts = [
      ESevenWondersScientificSymbol.GEAR,
      ESevenWondersScientificSymbol.COMPASS,
      ESevenWondersScientificSymbol.TABLET,
    ].map((symbol) => symbols.filter((s) => s === symbol).length);
    const setsCount = Math.min(...symbolsCounts);

    return symbolsCounts.reduce((points, count) => points + count ** 2, setsCount * setValue);
  }

  calculatePlayerPoints(player: ISevenWondersPlayer, effects: TSevenWondersEffect[]): number {
    let allPoints = 0;

    // effect points
    effects.forEach((effect) => {
      const gain = this.calculateEffectGain(effect, player);

      allPoints += gain?.points ?? 0;
    });

    // war points
    [...player.victoryPoints, ...player.defeatPoints].forEach((points) => {
      allPoints += points;
    });

    // science points
    const scientificEffects = effects.filter(isScientificSymbolsEffect);
    const scientificSetEffects = effects.filter(isScientificSetEffect);

    allPoints += this.calculateScientificEffectsMaxPoints(scientificEffects, scientificSetEffects);

    // coins points
    allPoints += Math.floor(player.coins / 3);

    return allPoints;
  }

  calculatePlayerMaxPoints(player: ISevenWondersPlayer): number {
    const effectsVariants = getAllPlayerEffects(player).map((effect) => {
      if (!isCopyEffect(effect)) {
        return [[effect]];
      }

      return effect.neighbors
        .map((neighborSide) => {
          return this.getNeighbor(player, neighborSide).builtCards
            .filter(({ type }) => type === effect.cardType)
            .map(({ effects }) => effects);
        })
        .flat();
    });
    const effectsCombinations = getAllCombinations(effectsVariants);

    return effectsCombinations.reduce((maxPoints, effects) => {
      return Math.max(maxPoints, this.calculatePlayerPoints(player, effects.flat()));
    }, 0);
  }

  usePlayerBuildEffect(player: ISevenWondersPlayer, effectIndex: number): void {
    const usedEffect = player.buildCardEffects[effectIndex];

    // TODO: use or remove count
    if (usedEffect.period !== ESevenWondersFreeCardPeriod.ETERNITY) {
      player.buildCardEffects.splice(effectIndex, 1);
    }
  }

  withdrawPlayersCoins(): void {
    this.players.forEach((player) => {
      player.coins += player.receivedCoinsDuringTurn;
      player.receivedCoinsDuringTurn = 0;
    });
  }

  executePlayerAction(
    player: ISevenWondersPlayer,
    executeActionEvent: ISevenWondersExecuteActionEvent,
  ): TSevenWondersEffect[] {
    const { cardIndex, action, payments } = executeActionEvent;

    if (action.type === ESevenWondersCardActionType.PICK_LEADER) {
      player.leadersHand.push(...player.leadersPool.splice(cardIndex, 1));

      return [];
    }

    const playerHandCards = getPlayerHandCards(player, this.discard, this.phase);
    const card = playerHandCards[cardIndex];
    const waitingBuildEffect = getWaitingBuildEffect(player);
    const newEffects: TSevenWondersEffect[] = [];

    if (action.type === ESevenWondersCardActionType.BUILD_STRUCTURE) {
      player.builtCards.push(card);

      if (!action.freeBuildType && !waitingBuildEffect?.isFree) {
        player.coins -= Math.max(0, (card.price?.coins ?? 0) - (action.discount ?? 0));
      }

      if (action.freeBuildType?.type === EBuildType.FREE_WITH_EFFECT) {
        this.usePlayerBuildEffect(player, action.freeBuildType.effectIndex);
      }

      newEffects.push(...card.effects);

      const effects = getAllPlayerEffects(player);

      if (card.type === ESevenWondersCardType.COMMERCIAL) {
        effects.filter(isCommercialCardsPassiveEffect).forEach((effect) => {
          player.coins += effect.count;
        });
      }

      if (action.freeBuildType?.type === EBuildType.FREE_BY_BUILDING) {
        effects.filter(isStructureInheritancePassiveEffect).forEach((effect) => {
          player.coins += effect.count;
        });
      }

      if (action.copiedCard) {
        player.copiedCard = action.copiedCard;

        newEffects.push(...action.copiedCard.effects);
      }
    } else if (action.type === ESevenWondersCardActionType.BUILD_WONDER_STAGE) {
      const city = getCity(player.city, player.citySide);
      const wonderLevel = city.wonders[action.stageIndex];

      player.builtStages.push({
        index: action.stageIndex,
        card,
        cardAge: this.age + 1,
      });
      player.coins -= wonderLevel.price.coins ?? 0;

      newEffects.push(...wonderLevel.effects);
    } else if (action.type === ESevenWondersCardActionType.DISCARD) {
      player.coins += 3;

      if (card.type !== ESevenWondersCardType.LEADER) {
        this.discard.push(card);
      }
    }

    playerHandCards.splice(cardIndex, 1);

    if (player.waitingForAction?.type === ESevenWondersWaitingActionType.EFFECT_BUILD_CARD) {
      this.usePlayerBuildEffect(player, player.waitingForAction.buildEffectIndex);
    }

    if (payments) {
      (
        Object.entries(payments) as [ESevenWondersNeighborSide, number][]
      ).forEach(([neighborSide, payment]) => {
        const neighbor = this.getNeighbor(player, neighborSide);

        neighbor.receivedCoinsDuringTurn += payment;
        player.coins -= payment;
      });
    }

    newEffects.forEach((effect) => {
      if (isBuildCardEffect(effect)) {
        player.buildCardEffects.push(effect);
      } else if (isDrawLeadersEffect(effect)) {
        player.leadersHand.push(...this.leadersDeck.splice(-effect.count));
      }
    });

    return newEffects;
  }

  setWaitingActions(): void {
    if (this.phase === ESevenWondersGamePhase.DRAFT_LEADERS) {
      return;
    }

    const isLastAgeTurn = this.isLastAgeTurn();
    let someoneBuildsLastCard = false;

    if (isLastAgeTurn) {
      this.players.forEach((player) => {
        const buildLastCardEffectIndex = player.buildCardEffects.findIndex((effect) => (
          effect.period === ESevenWondersFreeCardPeriod.LAST_AGE_TURN
        ));

        if (buildLastCardEffectIndex !== -1) {
          player.waitingForAction = {
            type: ESevenWondersWaitingActionType.EFFECT_BUILD_CARD,
            buildEffectIndex: buildLastCardEffectIndex,
          };

          someoneBuildsLastCard = true;
        }
      });
    }

    this.players.forEach((player) => {
      const buildNowEffectIndex = player.buildCardEffects.findIndex((effect) => (
        effect.period === ESevenWondersFreeCardPeriod.NOW
        && effect.source !== ESevenWondersFreeCardSource.DISCARD
      ));

      if (buildNowEffectIndex !== -1) {
        player.waitingForAction = {
          type: ESevenWondersWaitingActionType.EFFECT_BUILD_CARD,
          buildEffectIndex: buildNowEffectIndex,
        };
      }
    });

    if (someoneBuildsLastCard) {
      return;
    }

    if (isLastAgeTurn) {
      this.players.forEach((player) => {
        this.discard.push(...player.hand.splice(0));
      });
    }

    if (this.discard.length > 0) {
      let maxDiscardPriority = -Infinity;
      let highestDiscardTarget: {
        player: ISevenWondersPlayer;
        effectIndex: number;
      } | undefined;

      this.players.forEach((player) => {
        const buildFromDiscardEffectIndex = player.buildCardEffects.findIndex((effect) => (
          effect.period === ESevenWondersFreeCardPeriod.NOW
          && effect.source === ESevenWondersFreeCardSource.DISCARD
        ));

        if (buildFromDiscardEffectIndex !== -1) {
          const priority = player.buildCardEffects[buildFromDiscardEffectIndex].priority ?? -1;

          if (priority > maxDiscardPriority) {
            highestDiscardTarget = {
              player,
              effectIndex: buildFromDiscardEffectIndex,
            };
            maxDiscardPriority = priority;
          }
        }
      });

      if (highestDiscardTarget) {
        highestDiscardTarget.player.waitingForAction = {
          type: ESevenWondersWaitingActionType.EFFECT_BUILD_CARD,
          buildEffectIndex: highestDiscardTarget.effectIndex,
        };
      }
    }
  }

  onPlayerExecuteAction(player: ISevenWondersPlayer, action: ISevenWondersExecuteActionEvent): void {
    player.chosenActionEvent = action;

    if (this.isWaitingForActions()) {
      this.sendGameInfo();
    } else {
      const newPlayersEffects: {
        player: ISevenWondersPlayer;
        effects: TSevenWondersEffect[];
      }[] = [];

      this.players.forEach((player) => {
        if (player.chosenActionEvent) {
          newPlayersEffects.push({
            player,
            effects: this.executePlayerAction(player, player.chosenActionEvent),
          });
        }

        player.waitingForAction = null;
        player.chosenActionEvent = null;
      });

      newPlayersEffects.forEach(({ player, effects }) => {
        effects.forEach((effect) => {
          player.coins += this.calculateEffectGain(effect, player)?.coins ?? 0;
        });
      });

      this.setWaitingActions();
      this.tryToEndTurn();
    }
  }

  sendGameInfo(): void {
    this.io.emit(ESevenWondersGameEvent.GAME_INFO, this.getGameInfoEvent());
  }

  onGetGameInfo({ socket }: IGameEvent): void {
    socket.emit(ESevenWondersGameEvent.GAME_INFO, this.getGameInfoEvent());
  }

  onExecuteAction({ socket, data }: IGameEvent<ISevenWondersExecuteActionEvent>): void {
    const player = this.getPlayerByLogin(socket.user?.login);

    if (!player) {
      return;
    }

    this.onPlayerExecuteAction(player, data);
  }

  onCancelAction({ socket }: IGameEvent): void {
    const player = this.getPlayerByLogin(socket.user?.login);

    if (!player) {
      return;
    }

    if (player.chosenActionEvent) {
      player.chosenActionEvent = null;

      this.sendGameInfo();
    }
  }

  getGameInfoEvent(): ISevenWondersGameInfoEvent {
    return {
      players: this.players,
      discard: this.discard,
      age: this.age,
      phase: this.phase,
    };
  }

  deleteGame(): void {
    super.deleteGame();
  }
}

export default SevenWondersGame;
