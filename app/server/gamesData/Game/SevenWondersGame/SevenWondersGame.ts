import shuffle from 'lodash/shuffle';

import { ALL_LEADERS } from 'common/constants/games/sevenWonders';

import { EGame } from 'common/types/game';
import {
  ECity,
  EGamePhase,
  ENeighborSide,
  EPlayerDirection,
  EScientificSymbol,
  ICitySide,
  IGame,
  IGamePlayerData,
  IPlayer,
  IWonderBuiltStage,
} from 'common/types/sevenWonders';
import { ECardId, ECardType, ICard } from 'common/types/sevenWonders/cards';
import {
  EEffect,
  IGain,
  IScientificSetEffect,
  IScientificSymbolsEffect,
  TEffect,
} from 'common/types/sevenWonders/effects';

import { TGenerator } from 'server/gamesData/Game/utilities/Entity';
import GameEntity from 'server/gamesData/Game/utilities/GameEntity';
import getAllPlayerEffects from 'common/utilities/sevenWonders/getAllPlayerEffects';
import getNeighbor from 'common/utilities/sevenWonders/getNeighbor';
import {
  isCopyEffect,
  isScientificSetEffect,
  isScientificSymbolsEffect,
  isShieldsEffect,
} from 'common/utilities/sevenWonders/isEffect';
import { getSetsCombinations } from 'common/utilities/combinations';
import getPlayerCity from 'common/utilities/sevenWonders/getPlayerCity';
import getAgeDirection from 'common/utilities/sevenWonders/getAgeDirection';

import Age from 'server/gamesData/Game/SevenWondersGame/entities/Age';
import LeadersDraft from 'server/gamesData/Game/SevenWondersGame/entities/LeadersDraft';

const ALL_CITIES = Object.values(ECity);

interface ILeadersDraftPhase {
  type: EGamePhase.DRAFT_LEADERS;
  leadersDraft: LeadersDraft;
}

interface IAgePhase {
  type: EGamePhase.AGE;
  age: Age;
}

export default class SevenWondersGame extends GameEntity<EGame.SEVEN_WONDERS> {
  playersData: IGamePlayerData[] = this.getPlayersData(() => ({
    points: 0,
    builtCards: [],
    city: ECity.RHODOS,
    citySide: Number(Math.random() > 0.5),
    builtStages: [],
    coins: 6,
    victoryPoints: [],
    defeatPoints: [],
    leadersHand: [],
    copiedCard: null,
  }));
  phase: ILeadersDraftPhase | IAgePhase | null = null;
  discard: ICard[] = [];
  leadersDeck: ICard[] = [];

  *lifecycle(): TGenerator {
    const shuffledCities = shuffle(ALL_CITIES);

    this.leadersDeck = shuffle(ALL_LEADERS);

    this.playersData.forEach((playerData, playerIndex) => {
      playerData.city = shuffledCities[playerIndex];

      getAllPlayerEffects(playerData).forEach((effect) => {
        playerData.coins += this.calculateEffectGain(effect, playerIndex)?.coins ?? 0;
      });

      // if (!this.getPlayers()[playerIndex].isBot) {
      //   playerData.city = ECity.ROMA;
      //   playerData.citySide = 1;
      //   playerData.leadersHand.push(...ALL_LEADERS.filter(({ id }) => id === ECardId.BILKIS));
      // }

      // if (this.getPlayers()[playerIndex].login === '123') {
      //   playerData.city = ECity.ROMA;
      //   playerData.citySide = 1;
      //   playerData.leadersHand.push(...ALL_LEADERS.filter(({ id }) => id === ECardId.SOLOMON));
      // }
      //
      // if (this.getPlayers()[playerIndex].login === '234') {
      //   playerData.city = ECity.BABYLON;
      //   playerData.citySide = 1;
      //   playerData.leadersHand.push(...ALL_LEADERS.filter(({ id }) => id === ECardId.RAMSES));
      // }
      //
      // if (this.getPlayers()[playerIndex].login === '345') {
      //   playerData.city = ECity.HALIKARNASSOS;
      //   playerData.citySide = 1;
      // }
    });

    this.phase = {
      type: EGamePhase.DRAFT_LEADERS,
      leadersDraft: this.spawnEntity(new LeadersDraft(this)),
    };

    this.sendGameInfo();

    const pickedLeaders = yield* this.phase.leadersDraft;

    this.playersData.forEach((playerData, index) => {
      playerData.leadersHand.push(...pickedLeaders[index]);
    });

    for (let age = 0; age < 3; age++) {
      this.phase = {
        type: EGamePhase.AGE,
        age: this.spawnEntity(
          new Age(this, {
            age,
          }),
        ),
      };

      this.sendGameInfo();

      yield* this.phase.age;

      this.sendGameInfo();
    }

    this.playersData.forEach((playerData, playerIndex) => {
      playerData.points = this.calculatePlayerMaxPoints(playerIndex);
    });

    this.phase = null;

    this.sendGameInfo();
  }

  addDefeatToken(playerIndex: number): void {
    this.playersData[playerIndex].defeatPoints.push(-1);
  }

  addLeaders(playerIndex: number, count: number): void {
    this.playersData[playerIndex].leadersHand.push(...this.extractFromLeadersDeck(count));
  }

  addVictoryToken(playerIndex: number, value: number): void {
    this.playersData[playerIndex].victoryPoints.push(value);
  }

  buildCard(playerIndex: number, card: ICard): void {
    this.playersData[playerIndex].builtCards.push(card);
  }

  buildWonderStage(playerIndex: number, stage: IWonderBuiltStage): void {
    this.playersData[playerIndex].builtStages.push(stage);
  }

  calculateEffectGain(effect: TEffect, playerIndex: number): IGain | null {
    const { coins } = this.playersData[playerIndex];

    switch (effect.type) {
      case EEffect.GAIN: {
        return effect.gain;
      }

      case EEffect.CARDS_TYPE: {
        const gain: IGain = {};

        this.getDirectionsPlayers(playerIndex, effect.directions).forEach((playerIndex) => {
          const cardTypeCardCounts = effect.cardTypes.map((cardType) => {
            return this.getPlayerTypeCards(playerIndex, cardType).length;
          });
          const setsCount = Math.min(...cardTypeCardCounts);

          this.mergeGains(gain, effect.gain, setsCount);
        });

        return gain;
      }

      case EEffect.WONDER_LEVELS: {
        const gain: IGain = {};

        this.getDirectionsPlayers(playerIndex, effect.directions).forEach((playerIndex) => {
          this.mergeGains(gain, effect.gain, this.playersData[playerIndex].builtStages.length);
        });

        return gain;
      }

      case EEffect.WINS: {
        const gain: IGain = {};

        this.getDirectionsPlayers(playerIndex, effect.directions).forEach((playerIndex) => {
          this.mergeGains(gain, effect.gain, this.playersData[playerIndex].victoryPoints.length);
        });

        return gain;
      }

      case EEffect.LOSSES: {
        const gain: IGain = {};

        this.getDirectionsPlayers(playerIndex, effect.directions).forEach((playerIndex) => {
          this.mergeGains(gain, effect.gain, this.playersData[playerIndex].defeatPoints.length);
        });

        return gain;
      }

      case EEffect.GAIN_BY_COINS: {
        return this.mergeGains({}, effect.gain, Math.floor(coins / effect.count));
      }

      default: {
        return null;
      }
    }
  }

  calculatePlayerPoints(playerIndex: number, effects: TEffect[]): number {
    const { coins, defeatPoints, victoryPoints } = this.playersData[playerIndex];
    let allPoints = 0;

    // effect points
    effects.forEach((effect) => {
      const gain = this.calculateEffectGain(effect, playerIndex);

      allPoints += gain?.points ?? 0;
    });

    // war points
    [...victoryPoints, ...defeatPoints].forEach((points) => {
      allPoints += points;
    });

    // science points
    const scientificEffects = effects.filter(isScientificSymbolsEffect);
    const scientificSetEffects = effects.filter(isScientificSetEffect);

    allPoints += this.calculateScientificEffectsMaxPoints(scientificEffects, scientificSetEffects);

    // coins points
    allPoints += Math.floor(coins / 3);

    return allPoints;
  }

  calculatePlayerMaxPoints(playerIndex: number): number {
    const effectsVariants = this.getAllPlayerEffects(playerIndex).map((effect) => {
      if (!isCopyEffect(effect)) {
        return [[effect]];
      }

      if (effect.cardType !== ECardType.GUILD) {
        return [[]];
      }

      return effect.neighbors
        .map((neighborSide) => {
          return this.playersData[this.getNeighbor(playerIndex, neighborSide)].builtCards
            .filter(({ type }) => type === effect.cardType)
            .map(({ effects }) => effects);
        })
        .flat();
    });
    const effectsCombinations = getSetsCombinations(effectsVariants);

    return effectsCombinations.reduce((maxPoints, effects) => {
      return Math.max(maxPoints, this.calculatePlayerPoints(playerIndex, effects.flat()));
    }, 0);
  }

  calculateScientificCardsPoints(symbols: EScientificSymbol[], setValue: number): number {
    const symbolsCounts = Object.values(EScientificSymbol).map((symbol) => symbols.filter((s) => s === symbol).length);
    const setsCount = Math.min(...symbolsCounts);

    return symbolsCounts.reduce((points, count) => points + count ** 2, setsCount * setValue);
  }

  calculateScientificEffectsMaxPoints(
    effects: IScientificSymbolsEffect[],
    setsEffects: IScientificSetEffect[],
  ): number {
    const symbols = effects.map((effect) => effect.variants);
    const symbolsCombinations = getSetsCombinations(symbols);
    const setValue = setsEffects.reduce((setValue, setEffect) => {
      return setValue + (setEffect.gain.points ?? 0);
    }, 7);

    return symbolsCombinations.reduce((maxPoints, symbols) => {
      return Math.max(maxPoints, this.calculateScientificCardsPoints(symbols, setValue));
    }, 0);
  }

  changePlayerCoins(playerIndex: number, receivedCoins: number): void {
    this.playersData[playerIndex].coins += receivedCoins;
  }

  copyCard(playerIndex: number, card: ICard): void {
    this.playersData[playerIndex].copiedCard = card;
  }

  discardCards(cards: ICard[]): void {
    this.discard.push(...cards);
  }

  extractFromLeadersDeck(count: number): ICard[] {
    return this.leadersDeck.splice(-count);
  }

  getDirectionsPlayers(playerIndex: number, directions: EPlayerDirection[]): number[] {
    if (directions.includes(EPlayerDirection.ALL)) {
      return this.getPlayersData((playerIndex) => playerIndex);
    }

    return directions.reduce<number[]>((players, direction) => {
      let addedPlayer: number | undefined;

      if (direction === EPlayerDirection.SELF) {
        addedPlayer = playerIndex;
      } else if (direction === EPlayerDirection.LEFT) {
        addedPlayer = this.getNeighbor(playerIndex, ENeighborSide.LEFT);
      } else if (direction === EPlayerDirection.RIGHT) {
        addedPlayer = this.getNeighbor(playerIndex, ENeighborSide.RIGHT);
      }

      return addedPlayer === undefined ? players : [...players, addedPlayer];
    }, []);
  }

  getAgeDirection(age?: number): number {
    return getAgeDirection(this.phase?.type ?? null, age ?? null) === ENeighborSide.LEFT ? -1 : 1;
  }

  getAllPlayerEffects(playerIndex: number): TEffect[] {
    return getAllPlayerEffects(this.playersData[playerIndex]);
  }

  getGamePlayers(): IPlayer[] {
    const turn = this.phase?.type === EGamePhase.DRAFT_LEADERS ? this.phase.leadersDraft.turn : this.phase?.age.turn;

    return this.getPlayersWithData((playerIndex) => ({
      ...this.playersData[playerIndex],
      leadersDraft:
        this.phase?.type === EGamePhase.DRAFT_LEADERS ? this.phase.leadersDraft.playersData[playerIndex] : null,
      age: this.phase?.type === EGamePhase.AGE ? this.phase.age.playersData[playerIndex] : null,
      turn: turn?.playersData[playerIndex] ?? null,
    }));
  }

  getNeighbor(playerIndex: number, neighborSide: ENeighborSide): number {
    return getNeighbor(playerIndex, this.playersCount, neighborSide);
  }

  getPlayerCity(playerIndex: number): ICitySide {
    return getPlayerCity(this.playersData[playerIndex]);
  }

  getPlayerShieldsCount(playerIndex: number): number {
    return this.getAllPlayerEffects(playerIndex)
      .filter(isShieldsEffect)
      .reduce((shieldsCount, effect) => {
        return shieldsCount + effect.count;
      }, 0);
  }

  getPlayerTypeCards(playerIndex: number, cardType: ECardType): ICard[] {
    return this.playersData[playerIndex].builtCards.filter((card) => card.type === cardType);
  }

  mergeGains(target: IGain, source: IGain, coefficient: number): IGain {
    if (source.points) {
      target.points = (target.points ?? 0) + source.points * coefficient;
    }

    if (source.coins) {
      target.coins = (target.coins ?? 0) + source.coins * coefficient;
    }

    return target;
  }

  toJSON(): IGame {
    return {
      players: this.getGamePlayers(),
      discard: this.discard,
      phase:
        this.phase &&
        (this.phase.type === EGamePhase.DRAFT_LEADERS
          ? { type: EGamePhase.DRAFT_LEADERS }
          : { type: EGamePhase.AGE, ...this.phase.age.toJSON() }),
    };
  }
}
