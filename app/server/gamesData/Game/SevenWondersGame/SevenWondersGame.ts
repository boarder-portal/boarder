import shuffle from 'lodash/shuffle';

import { ALL_LEADERS } from 'common/constants/games/sevenWonders';

import { GameType } from 'common/types/game';
import {
  CityName,
  CitySide,
  Game,
  GamePhaseType,
  GamePlayerData,
  GameResult,
  NeighborSide,
  Player,
  PlayerDirection,
  ScientificSymbolType,
  WonderBuiltStage,
} from 'common/types/games/sevenWonders';
import { Card, CardType } from 'common/types/games/sevenWonders/cards';
import {
  Effect,
  EffectType,
  Gain,
  ScientificSetEffect,
  ScientificSymbolsEffect,
} from 'common/types/games/sevenWonders/effects';

import { getSetsCombinations } from 'common/utilities/combinations';
import getAgeDirection from 'common/utilities/games/sevenWonders/getAgeDirection';
import getAllPlayerEffects from 'common/utilities/games/sevenWonders/getAllPlayerEffects';
import getNeighbor from 'common/utilities/games/sevenWonders/getNeighbor';
import getPlayerCity from 'common/utilities/games/sevenWonders/getPlayerCity';
import {
  isCopyEffect,
  isScientificSetEffect,
  isScientificSymbolsEffect,
  isShieldsEffect,
} from 'common/utilities/games/sevenWonders/isEffect';
import Entity, { EntityGenerator } from 'server/gamesData/Game/utilities/Entity/Entity';
import GameInfo from 'server/gamesData/Game/utilities/Entity/components/GameInfo';
import Server from 'server/gamesData/Game/utilities/Entity/components/Server';

import Age from 'server/gamesData/Game/SevenWondersGame/entities/Age';
import LeadersDraft from 'server/gamesData/Game/SevenWondersGame/entities/LeadersDraft';
import PickCitySide from 'server/gamesData/Game/SevenWondersGame/entities/PickCitySide';

interface PickCitySidePhase {
  type: GamePhaseType.PICK_CITY_SIDE;
  pickCitySide: PickCitySide;
}

interface LeadersDraftPhase {
  type: GamePhaseType.DRAFT_LEADERS;
  leadersDraft: LeadersDraft;
}

interface AgePhase {
  type: GamePhaseType.AGE;
  age: Age;
}

export default class SevenWondersGame extends Entity<GameResult> {
  gameInfo = this.obtainComponent(GameInfo<GameType.SEVEN_WONDERS, this>);
  server = this.obtainComponent(Server<GameType.SEVEN_WONDERS, this>);

  playersData = this.gameInfo.createPlayersData<GamePlayerData>({
    init: () => ({
      points: 0,
      builtCards: [],
      city: CityName.RHODOS,
      citySide: 0,
      builtStages: [],
      coins: this.gameInfo.options.includeLeaders ? 6 : 3,
      victoryPoints: [],
      defeatPoints: [],
      leadersHand: [],
      copiedCard: null,
    }),
  });
  phase: PickCitySidePhase | LeadersDraftPhase | AgePhase | null = null;
  discard: Card[] = [];
  leadersDeck: Card[] = [];

  *lifecycle(): EntityGenerator<GameResult> {
    const { includeLeaders } = this.gameInfo.options;

    if (includeLeaders) {
      this.leadersDeck = shuffle(ALL_LEADERS);
    }

    this.phase = {
      type: GamePhaseType.PICK_CITY_SIDE,
      pickCitySide: this.spawnEntity(PickCitySide),
    };

    this.server.sendGameInfo();

    const citiesInfo = yield* this.waitForEntity(this.phase.pickCitySide);

    this.playersData.forEach((playerData, playerIndex) => {
      const { city, pickedSide } = citiesInfo[playerIndex];

      playerData.city = city;
      playerData.citySide = pickedSide;

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

    if (includeLeaders) {
      this.phase = {
        type: GamePhaseType.DRAFT_LEADERS,
        leadersDraft: this.spawnEntity(LeadersDraft),
      };

      this.server.sendGameInfo();

      const pickedLeaders = yield* this.waitForEntity(this.phase.leadersDraft);

      this.playersData.forEach((playerData, index) => {
        playerData.leadersHand.push(...pickedLeaders[index]);
      });
    }

    for (let age = 0; age < 3; age++) {
      this.phase = {
        type: GamePhaseType.AGE,
        age: this.spawnEntity(Age, {
          age,
        }),
      };

      this.server.sendGameInfo();

      yield* this.waitForEntity(this.phase.age);

      this.server.sendGameInfo();
    }

    this.playersData.forEach((playerData, playerIndex) => {
      playerData.points = this.calculatePlayerMaxPoints(playerIndex);
    });

    this.phase = null;

    this.server.sendGameInfo();
  }

  addDefeatToken(playerIndex: number): void {
    this.playersData.get(playerIndex).defeatPoints.push(-1);
  }

  addLeaders(playerIndex: number, count: number): void {
    this.playersData.get(playerIndex).leadersHand.push(...this.extractFromLeadersDeck(count));
  }

  addVictoryToken(playerIndex: number, value: number): void {
    this.playersData.get(playerIndex).victoryPoints.push(value);
  }

  buildCard(playerIndex: number, card: Card): void {
    this.playersData.get(playerIndex).builtCards.push(card);
  }

  buildWonderStage(playerIndex: number, stage: WonderBuiltStage): void {
    this.playersData.get(playerIndex).builtStages.push(stage);
  }

  calculateEffectGain(effect: Effect, playerIndex: number): Gain | null {
    const { coins } = this.playersData.get(playerIndex);

    switch (effect.type) {
      case EffectType.GAIN: {
        return effect.gain;
      }

      case EffectType.CARDS_TYPE: {
        const gain: Gain = {};

        this.getDirectionsPlayers(playerIndex, effect.directions).forEach((playerIndex) => {
          const cardTypeCardCounts = effect.cardTypes.map((cardType) => {
            return this.getPlayerTypeCards(playerIndex, cardType).length;
          });
          const setsCount = Math.min(...cardTypeCardCounts);

          this.mergeGains(gain, effect.gain, setsCount);
        });

        return gain;
      }

      case EffectType.WONDER_LEVELS: {
        const gain: Gain = {};

        this.getDirectionsPlayers(playerIndex, effect.directions).forEach((playerIndex) => {
          this.mergeGains(gain, effect.gain, this.playersData.get(playerIndex).builtStages.length);
        });

        return gain;
      }

      case EffectType.WINS: {
        const gain: Gain = {};

        this.getDirectionsPlayers(playerIndex, effect.directions).forEach((playerIndex) => {
          this.mergeGains(gain, effect.gain, this.playersData.get(playerIndex).victoryPoints.length);
        });

        return gain;
      }

      case EffectType.LOSSES: {
        const gain: Gain = {};

        this.getDirectionsPlayers(playerIndex, effect.directions).forEach((playerIndex) => {
          this.mergeGains(gain, effect.gain, this.playersData.get(playerIndex).defeatPoints.length);
        });

        return gain;
      }

      case EffectType.GAIN_BY_COINS: {
        return this.mergeGains({}, effect.gain, Math.floor(coins / effect.count));
      }

      default: {
        return null;
      }
    }
  }

  calculatePlayerPoints(playerIndex: number, effects: Effect[]): number {
    const { coins, defeatPoints, victoryPoints } = this.playersData.get(playerIndex);
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

      if (effect.cardType !== CardType.GUILD) {
        return [[]];
      }

      return effect.neighbors
        .map((neighborSide) => {
          return this.playersData
            .get(this.getNeighbor(playerIndex, neighborSide))
            .builtCards.filter(({ type }) => type === effect.cardType)
            .map(({ effects }) => effects);
        })
        .flat();
    });
    const effectsCombinations = getSetsCombinations(effectsVariants);

    return effectsCombinations.reduce((maxPoints, effects) => {
      return Math.max(maxPoints, this.calculatePlayerPoints(playerIndex, effects.flat()));
    }, 0);
  }

  calculateScientificCardsPoints(symbols: ScientificSymbolType[], setValue: number): number {
    const symbolsCounts = Object.values(ScientificSymbolType).map(
      (symbol) => symbols.filter((s) => s === symbol).length,
    );
    const setsCount = Math.min(...symbolsCounts);

    return symbolsCounts.reduce((points, count) => points + count ** 2, setsCount * setValue);
  }

  calculateScientificEffectsMaxPoints(effects: ScientificSymbolsEffect[], setsEffects: ScientificSetEffect[]): number {
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
    this.playersData.get(playerIndex).coins += receivedCoins;
  }

  copyCard(playerIndex: number, card: Card): void {
    this.playersData.get(playerIndex).copiedCard = card;
  }

  discardCards(cards: Card[]): void {
    this.discard.push(...cards);
  }

  extractFromLeadersDeck(count: number): Card[] {
    return this.leadersDeck.splice(-count);
  }

  getDirectionsPlayers(playerIndex: number, directions: PlayerDirection[]): number[] {
    if (directions.includes(PlayerDirection.ALL)) {
      return this.gameInfo.getPlayersData((playerIndex) => playerIndex);
    }

    return directions.reduce<number[]>((players, direction) => {
      let addedPlayer: number | undefined;

      if (direction === PlayerDirection.SELF) {
        addedPlayer = playerIndex;
      } else if (direction === PlayerDirection.LEFT) {
        addedPlayer = this.getNeighbor(playerIndex, NeighborSide.LEFT);
      } else if (direction === PlayerDirection.RIGHT) {
        addedPlayer = this.getNeighbor(playerIndex, NeighborSide.RIGHT);
      }

      return addedPlayer === undefined ? players : [...players, addedPlayer];
    }, []);
  }

  getAgeDirection(age?: number): number {
    return getAgeDirection(this.phase?.type ?? null, age ?? null) === NeighborSide.LEFT ? -1 : 1;
  }

  getAllPlayerEffects(playerIndex: number): Effect[] {
    return getAllPlayerEffects(this.playersData.get(playerIndex));
  }

  getGamePlayers(): Player[] {
    const turn =
      this.phase?.type === GamePhaseType.DRAFT_LEADERS
        ? this.phase.leadersDraft.turn
        : this.phase?.type === GamePhaseType.AGE
        ? this.phase?.age.turn
        : null;

    return this.gameInfo.getPlayersWithData((playerIndex) => ({
      ...this.playersData.get(playerIndex),
      pickCitySide:
        this.phase?.type === GamePhaseType.PICK_CITY_SIDE ? this.phase.pickCitySide.playersData.get(playerIndex) : null,
      leadersDraft:
        this.phase?.type === GamePhaseType.DRAFT_LEADERS ? this.phase.leadersDraft.playersData.get(playerIndex) : null,
      age: this.phase?.type === GamePhaseType.AGE ? this.phase.age.playersData.get(playerIndex) : null,
      turn: turn?.playersData.get(playerIndex) ?? null,
    }));
  }

  getNeighbor(playerIndex: number, neighborSide: NeighborSide): number {
    return getNeighbor(playerIndex, this.gameInfo.playersCount, neighborSide);
  }

  getPlayerCity(playerIndex: number): CitySide {
    return getPlayerCity(this.playersData.get(playerIndex));
  }

  getPlayerShieldsCount(playerIndex: number): number {
    return this.getAllPlayerEffects(playerIndex)
      .filter(isShieldsEffect)
      .reduce((shieldsCount, effect) => {
        return shieldsCount + effect.count;
      }, 0);
  }

  getPlayerTypeCards(playerIndex: number, cardType: CardType): Card[] {
    return this.playersData.get(playerIndex).builtCards.filter((card) => card.type === cardType);
  }

  mergeGains(target: Gain, source: Gain, coefficient: number): Gain {
    if (source.points) {
      target.points = (target.points ?? 0) + source.points * coefficient;
    }

    if (source.coins) {
      target.coins = (target.coins ?? 0) + source.coins * coefficient;
    }

    return target;
  }

  toJSON(): Game {
    return {
      players: this.getGamePlayers(),
      discard: this.discard,
      phase:
        this.phase &&
        (this.phase.type === GamePhaseType.DRAFT_LEADERS
          ? { type: GamePhaseType.DRAFT_LEADERS }
          : this.phase.type === GamePhaseType.PICK_CITY_SIDE
          ? { type: GamePhaseType.PICK_CITY_SIDE }
          : { type: GamePhaseType.AGE, ...this.phase.age.toJSON() }),
    };
  }
}
