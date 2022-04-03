import shuffle from 'lodash/shuffle';
import chunk from 'lodash/chunk';
import times from 'lodash/times';
import random from 'lodash/random';

import { GAMES_CONFIG } from 'common/constants/gamesConfig';

import { IGameEvent } from 'server/types';
import { EGame } from 'common/types/game';
import { EPlayerStatus, IPlayer } from 'common/types';
import {
  ESevenWondersAdditionalActionType,
  ESevenWondersCardActionType,
  ESevenWondersCity,
  ESevenWondersGameEvent,
  ESevenWondersNeighborSide,
  ESevenWondersScientificSymbol,
  ISevenWondersExecuteActionEvent,
  ISevenWondersGameInfoEvent,
  ISevenWondersPlayer,
} from 'common/types/sevenWonders';
import {
  ESevenWondersCardType,
  ESevenWondersPlayerDirection,
  ISevenWondersCard,
} from 'common/types/sevenWonders/cards';
import {
  ESevenWondersFreeCardPeriod,
  ESevenWondersFreeCardSource,
  ISevenWondersEffect,
  ISevenWondersGain,
  ISevenWondersScientificSymbolsEffect,
  TSevenWondersEffect,
} from 'common/types/sevenWonders/effects';
import {
  EBuildType,
} from 'client/pages/Game/components/SevenWondersGame/components/MainBoard/components/HandCard/types';

import { getAllCombinations } from 'common/utilities/combinations';
import {
  isBuildCardEffect,
  isCopyEffect,
  isScientificSymbolsEffect,
  isShieldsEffect,
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
    },
  },
} = GAMES_CONFIG;

const ALL_CITIES = Object.values(ESevenWondersCity);
const BOTS_COUNT = 1;

class SevenWondersGame extends Game<EGame.SEVEN_WONDERS> {
  handlers = {
    [ESevenWondersGameEvent.GET_GAME_INFO]: this.onGetGameInfo,
    [ESevenWondersGameEvent.EXECUTE_ACTION]: this.onExecuteAction,
    [ESevenWondersGameEvent.CANCEL_ACTION]: this.onCancelAction,
  };

  age = -1;
  discard: ISevenWondersCard[] = [];

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
      coins: 3,
      victoryPoints: [],
      defeatPoints: [],
      isBot: false,
      actions: [],
      waitingAdditionalAction: null,
      buildCardEffects: [],
    };
  }

  createGameInfo(): void {
    const shuffledCities = shuffle(ALL_CITIES);

    times(BOTS_COUNT, (index) => {
      this.players.push({
        ...this.createPlayer({
          status: EPlayerStatus.PLAYING,
          login: `bot-${index}`,
        }),
        isBot: true,
      });
    });

    this.players = shuffle(this.players);

    this.players.forEach((player, playerIndex) => {
      player.city = shuffledCities[playerIndex];

      getAllPlayerEffects(player).forEach((effect) => {
        player.coins += this.calculateEffectGain(effect, player)?.coins ?? 0;
      });

      // if (!player.isBot) {
      //   player.city = ESevenWondersCity.HALIKARNASSOS;
      //   player.citySide = 1;
      // }
    });

    this.startAge();
  }

  startAge(): void {
    this.age++;

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
        ) {
          player.buildCardEffects.push(effect);
        }
      });
    });

    this.startTurn();
  }

  startTurn(): void {
    this.players.forEach((player) => {
      if (player.isBot) {
        setTimeout(() => {
          player.hand = shuffle(player.hand);

          this.onPlayerExecuteAction(player, {
            cardIndex: 0,
            action: {
              type: ESevenWondersCardActionType.BUILD_STRUCTURE,
              freeBuildType: {
                type: EBuildType.FREE_BY_BUILDING,
              },
            },
          });
        }, random(1000, 5000, true));
      }
    });
  }

  tryToEndTurn(): void {
    if (this.isWaitingForAdditionalActions()) {
      // TODO: conditionally send info
      this.sendGameInfo();
    } else {
      this.endTurn();
    }
  }

  endTurn(): void {
    const hands = this.players.map(({ hand }) => hand);
    const ageDirection = getAgeDirection(this.age);

    this.players.forEach((player, playerIndex) => {
      const neighbor = this.getNeighbor(player, ageDirection);

      neighbor.hand = hands[playerIndex];

      player.actions = [];
    });

    if (this.isLastAgeTurn()) {
      this.endAge();
    } else {
      this.startTurn();
    }

    this.sendGameInfo();
  }

  endAge(): void {
    const ageVictoryPoints = 2 * this.age + 1;

    this.players.forEach((player) => {
      const playerShieldsCount = this.getPlayerShieldsCount(player);

      [
        this.getNeighbor(player, ESevenWondersNeighborSide.LEFT),
        this.getNeighbor(player, ESevenWondersNeighborSide.RIGHT),
      ].forEach((neighbor) => {
        const neighborShieldsCount = this.getPlayerShieldsCount(neighbor);

        if (playerShieldsCount > neighborShieldsCount) {
          player.victoryPoints.push(ageVictoryPoints);
        } else if (playerShieldsCount < neighborShieldsCount) {
          player.defeatPoints.push(-1);
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

  isWaitingForAdditionalActions(): boolean {
    return this.players.some(({ waitingAdditionalAction }) => waitingAdditionalAction);
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

  mergeGains(target: ISevenWondersGain, source: ISevenWondersGain, coefficient: number): void {
    if (source.points) {
      target.points = (target.points ?? 0) + source.points * coefficient;
    }

    if (source.coins) {
      target.coins = (target.coins ?? 0) + source.coins * coefficient;
    }
  }

  calculateEffectGain(effect: TSevenWondersEffect, player: ISevenWondersPlayer): ISevenWondersGain | null {
    switch (effect.type) {
      case ISevenWondersEffect.GAIN: {
        return effect.gain;
      }

      case ISevenWondersEffect.CARDS_TYPE: {
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

      case ISevenWondersEffect.WONDER_LEVELS: {
        const gain: ISevenWondersGain = {};

        this.getDirectionsPlayers(player, effect.directions).forEach((player) => {
          this.mergeGains(gain, effect.gain, player.builtStages.length);
        });

        return gain;
      }

      case ISevenWondersEffect.WINS: {
        const gain: ISevenWondersGain = {};

        this.getDirectionsPlayers(player, effect.directions).forEach((player) => {
          this.mergeGains(gain, effect.gain, player.victoryPoints.length);
        });

        return gain;
      }

      case ISevenWondersEffect.LOSSES: {
        const gain: ISevenWondersGain = {};

        this.getDirectionsPlayers(player, effect.directions).forEach((player) => {
          this.mergeGains(gain, effect.gain, player.defeatPoints.length);
        });

        return gain;
      }

      default: {
        return null;
      }
    }
  }

  calculateScientificEffectsMaxPoints(effects: ISevenWondersScientificSymbolsEffect[]): number {
    const symbols = effects.map((effect) => effect.variants);
    const symbolsCombinations = getAllCombinations(symbols);

    return symbolsCombinations.reduce((maxPoints, symbols) => {
      return Math.max(maxPoints, this.calculateScientificCardsPoints(symbols));
    }, 0);
  }

  calculateScientificCardsPoints(symbols: ESevenWondersScientificSymbol[]): number {
    const symbolsCounts = [
      ESevenWondersScientificSymbol.GEAR,
      ESevenWondersScientificSymbol.COMPASS,
      ESevenWondersScientificSymbol.TABLET,
    ].map((symbol) => symbols.filter((s) => s === symbol).length);
    const setsCount = Math.min(...symbolsCounts);

    return symbolsCounts.reduce((points, count) => points + count ** 2, setsCount * 7);
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

    allPoints += this.calculateScientificEffectsMaxPoints(scientificEffects);

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

  executePlayerAction(player: ISevenWondersPlayer, executeActionEvent: ISevenWondersExecuteActionEvent): void {
    const { cardIndex, action, payments } = executeActionEvent;

    const playerHandCards = getPlayerHandCards(player, this.discard);
    const card = playerHandCards[cardIndex];
    const waitingBuildEffect = getWaitingBuildEffect(player);
    const newEffects: TSevenWondersEffect[] = [];

    if (action.type === ESevenWondersCardActionType.BUILD_STRUCTURE) {
      player.builtCards.push(card);

      if (!action.freeBuildType && !waitingBuildEffect?.isFree) {
        player.coins -= card.price?.coins ?? 0;
      }

      if (action.freeBuildType?.type === EBuildType.FREE_WITH_EFFECT) {
        this.usePlayerBuildEffect(player, action.freeBuildType.effectIndex);
      }

      newEffects.push(...card.effects);
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

      this.discard.push(card);
    }

    playerHandCards.splice(cardIndex, 1);

    if (player.waitingAdditionalAction?.type === ESevenWondersAdditionalActionType.BUILD_CARD) {
      this.usePlayerBuildEffect(player, player.waitingAdditionalAction.buildEffectIndex);
    }

    player.waitingAdditionalAction = null;

    if (payments) {
      (
        Object.entries(payments) as [ESevenWondersNeighborSide, number][]
      ).forEach(([neighborSide, payment]) => {
        const neighbor = this.getNeighbor(player, neighborSide);

        neighbor.coins += payment;
        player.coins -= payment;
      });
    }

    // FIXME: this should be called after all moves
    newEffects.forEach((effect) => {
      player.coins += this.calculateEffectGain(effect, player)?.coins ?? 0;

      if (isBuildCardEffect(effect)) {
        player.buildCardEffects.push(effect);
      }
    });
  }

  setAdditionalActions(): void {
    const isLastAgeTurn = this.isLastAgeTurn();
    let someoneBuildsLastCard = false;

    if (isLastAgeTurn) {
      this.players.forEach((player) => {
        const buildLastCardEffectIndex = player.buildCardEffects.findIndex((effect) => (
          effect.period === ESevenWondersFreeCardPeriod.LAST_AGE_TURN
        ));

        if (buildLastCardEffectIndex !== -1) {
          player.waitingAdditionalAction = {
            type: ESevenWondersAdditionalActionType.BUILD_CARD,
            buildEffectIndex: buildLastCardEffectIndex,
          };

          someoneBuildsLastCard = true;
        }
      });
    }

    if (someoneBuildsLastCard) {
      return;
    }

    if (isLastAgeTurn) {
      this.players.forEach((player) => {
        this.discard.push(...player.hand);

        player.hand = [];
      });
    }

    // TODO: prioritize Halicarnassus over Solomon
    this.players.forEach((player) => {
      const buildCardEffectIndex = player.buildCardEffects.findIndex((effect) => (
        effect.period === ESevenWondersFreeCardPeriod.NOW
        && (
          effect.source === ESevenWondersFreeCardSource.HAND
          || this.discard.length > 0
        )
      ));

      if (buildCardEffectIndex !== -1) {
        player.waitingAdditionalAction = {
          type: ESevenWondersAdditionalActionType.BUILD_CARD,
          buildEffectIndex: buildCardEffectIndex,
        };
      }
    });
  }

  onPlayerExecuteAction(player: ISevenWondersPlayer, action: ISevenWondersExecuteActionEvent): void {
    player.actions.push(action);

    if (this.isWaitingForAdditionalActions()) {
      this.executePlayerAction(player, action);
      this.setAdditionalActions();
      this.tryToEndTurn();
    } else if (this.players.every((p) => p.actions.length === 1)) {
      this.players.forEach((player) => {
        player.actions.forEach((action) => {
          this.executePlayerAction(player, action);
        });
      });

      this.setAdditionalActions();
      this.tryToEndTurn();
    } else {
      this.sendGameInfo();
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

    const beforeMainActions = this.players.some(({ actions }) => actions.length === 0);

    if (beforeMainActions) {
      player.actions.pop();

      this.sendGameInfo();
    }
  }

  getGameInfoEvent(): ISevenWondersGameInfoEvent {
    return {
      players: this.players,
      discard: this.discard,
      age: this.age,
    };
  }

  deleteGame(): void {
    super.deleteGame();
  }
}

export default SevenWondersGame;
