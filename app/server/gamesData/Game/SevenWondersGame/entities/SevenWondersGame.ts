import shuffle from 'lodash/shuffle';

import { ALL_LEADERS } from 'common/constants/games/sevenWonders';

import { EGame } from 'common/types/game';
import {
  ECity,
  EGameEvent,
  EGamePhase,
  ENeighborSide,
  EPlayerDirection,
  EScientificSymbol,
  IGame,
  IPlayer,
} from 'common/types/sevenWonders';
import { ECardType, ICard } from 'common/types/sevenWonders/cards';
import {
  EEffect,
  IGain,
  IScientificSetEffect,
  IScientificSymbolsEffect,
  TEffect,
} from 'common/types/sevenWonders/effects';

import GameEntity from 'server/gamesData/Game/utilities/GameEntity';
import getAllPlayerEffects from 'common/utilities/sevenWonders/getAllPlayerEffects';
import getNeighbor from 'common/utilities/sevenWonders/getNeighbor';
import {
  isCopyEffect,
  isScientificSetEffect,
  isScientificSymbolsEffect,
  isShieldsEffect,
} from 'common/utilities/sevenWonders/isEffect';
import { getAllCombinations } from 'common/utilities/combinations';

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
  phase: ILeadersDraftPhase | IAgePhase | null = null;
  discard: ICard[] = [];
  leadersDeck: ICard[] = [];

  *lifecycle() {
    const shuffledCities = shuffle(ALL_CITIES);

    this.leadersDeck = shuffle(ALL_LEADERS);

    this.players.forEach((player, playerIndex) => {
      player.city = shuffledCities[playerIndex];

      getAllPlayerEffects(player).forEach((effect) => {
        player.coins += this.calculateEffectGain(effect, player)?.coins ?? 0;
      });

      // if (!player.isBot) {
      //   player.city = ECity.ROMA;
      //   player.citySide = 1;
      //   player.leadersHand.push(...ALL_LEADERS.filter(({ id }) => id === ECardId.BILKIS));
      // }

      // if (player.login === '123') {
      //   player.city = ESevenWondersCity.ROMA;
      //   player.citySide = 1;
      //   player.leadersHand.push(...ALL_LEADERS.filter(({ id }) => id === ECardId.SOLOMON));
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

    this.phase = {
      type: EGamePhase.DRAFT_LEADERS,
      leadersDraft: this.spawnEntity(new LeadersDraft(this)),
    };

    this.sendGameInfo();

    const pickedLeaders = yield* this.phase.leadersDraft;

    this.players.forEach((player, index) => {
      player.leadersHand = pickedLeaders[index];
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

    this.players.forEach((player) => {
      player.points = this.calculatePlayerMaxPoints(player);
    });

    this.sendGameInfo();
  }

  calculateEffectGain(effect: TEffect, player: IPlayer): IGain | null {
    switch (effect.type) {
      case EEffect.GAIN: {
        return effect.gain;
      }

      case EEffect.CARDS_TYPE: {
        const gain: IGain = {};

        this.getDirectionsPlayers(player, effect.directions).forEach((player) => {
          const cardTypeCardCounts = effect.cardTypes.map((cardType) => {
            return this.getPlayerTypeCards(player, cardType).length;
          });
          const setsCount = Math.min(...cardTypeCardCounts);

          this.mergeGains(gain, effect.gain, setsCount);
        });

        return gain;
      }

      case EEffect.WONDER_LEVELS: {
        const gain: IGain = {};

        this.getDirectionsPlayers(player, effect.directions).forEach((player) => {
          this.mergeGains(gain, effect.gain, player.builtStages.length);
        });

        return gain;
      }

      case EEffect.WINS: {
        const gain: IGain = {};

        this.getDirectionsPlayers(player, effect.directions).forEach((player) => {
          this.mergeGains(gain, effect.gain, player.victoryPoints.length);
        });

        return gain;
      }

      case EEffect.LOSSES: {
        const gain: IGain = {};

        this.getDirectionsPlayers(player, effect.directions).forEach((player) => {
          this.mergeGains(gain, effect.gain, player.defeatPoints.length);
        });

        return gain;
      }

      case EEffect.GAIN_BY_COINS: {
        return this.mergeGains({}, effect.gain, Math.floor(player.coins / effect.count));
      }

      default: {
        return null;
      }
    }
  }

  calculatePlayerPoints(player: IPlayer, effects: TEffect[]): number {
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

  calculatePlayerMaxPoints(player: IPlayer): number {
    const effectsVariants = getAllPlayerEffects(player).map((effect) => {
      if (!isCopyEffect(effect)) {
        return [[effect]];
      }

      if (effect.cardType !== ECardType.GUILD) {
        return [[]];
      }

      return effect.neighbors
        .map((neighborSide) => {
          return this.getNeighbor(player, neighborSide)
            .builtCards.filter(({ type }) => type === effect.cardType)
            .map(({ effects }) => effects);
        })
        .flat();
    });
    const effectsCombinations = getAllCombinations(effectsVariants);

    return effectsCombinations.reduce((maxPoints, effects) => {
      return Math.max(maxPoints, this.calculatePlayerPoints(player, effects.flat()));
    }, 0);
  }

  calculateScientificCardsPoints(symbols: EScientificSymbol[], setValue: number): number {
    const symbolsCounts = [EScientificSymbol.GEAR, EScientificSymbol.COMPASS, EScientificSymbol.TABLET].map(
      (symbol) => symbols.filter((s) => s === symbol).length,
    );
    const setsCount = Math.min(...symbolsCounts);

    return symbolsCounts.reduce((points, count) => points + count ** 2, setsCount * setValue);
  }

  calculateScientificEffectsMaxPoints(
    effects: IScientificSymbolsEffect[],
    setsEffects: IScientificSetEffect[],
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

  discardCards(cards: ICard[]): void {
    this.discard.push(...cards);
  }

  extractFromLeadersDeck(count: number): ICard[] {
    return this.leadersDeck.splice(-count);
  }

  getDirectionsPlayers(player: IPlayer, directions: EPlayerDirection[]): IPlayer[] {
    if (directions.includes(EPlayerDirection.ALL)) {
      return this.players;
    }

    return directions.reduce<IPlayer[]>((players, direction) => {
      let addedPlayer: IPlayer | undefined;

      if (direction === EPlayerDirection.SELF) {
        addedPlayer = player;
      } else if (direction === EPlayerDirection.LEFT) {
        addedPlayer = this.getNeighbor(player, ENeighborSide.LEFT);
      } else if (direction === EPlayerDirection.RIGHT) {
        addedPlayer = this.getNeighbor(player, ENeighborSide.RIGHT);
      }

      return addedPlayer ? [...players, addedPlayer] : players;
    }, []);
  }

  getNeighbor(player: IPlayer, neighborSide: ENeighborSide): IPlayer {
    return getNeighbor(this.players, player, neighborSide);
  }

  getPlayerShieldsCount(player: IPlayer): number {
    return getAllPlayerEffects(player)
      .filter(isShieldsEffect)
      .reduce((shieldsCount, effect) => {
        return shieldsCount + effect.count;
      }, 0);
  }

  getPlayerTypeCards(player: IPlayer, cardType: ECardType): ICard[] {
    return player.builtCards.filter((card) => card.type === cardType);
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

  sendGameInfo(): void {
    this.sendSocketEvent(EGameEvent.GAME_INFO, this.toJSON());
  }

  toJSON(): IGame {
    return {
      players: this.players,
      discard: this.discard,
      phase:
        this.phase &&
        (this.phase.type === EGamePhase.DRAFT_LEADERS
          ? { type: EGamePhase.DRAFT_LEADERS, ...this.phase.leadersDraft.toJSON() }
          : { type: EGamePhase.AGE, ...this.phase.age.toJSON() }),
    };
  }
}
