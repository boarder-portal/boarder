import shuffle from 'lodash/shuffle';
import chunk from 'lodash/chunk';
import times from 'lodash/times';

import { GAMES_CONFIG } from 'common/constants/gamesConfig';

import { IGameEvent } from 'server/types';
import { EGame } from 'common/types/game';
import { EPlayerStatus, IPlayer } from 'common/types';
import {
  ESevenWondersCity,
  ESevenWondersGameEvent,
  ESevenWondersNeighbor,
  ESevenWondersScientificSymbol,
  ISevenWondersCitySide,
  ISevenWondersGameInfoEvent,
  ISevenWondersPlayer,
} from 'common/types/sevenWonders';
import {
  ESevenWondersCardType,
  ESevenWondersPlayerDirection,
  ISevenWondersCard,
} from 'common/types/sevenWonders/cards';
import {
  ISevenWondersEffect,
  ISevenWondersGain,
  ISevenWondersScientificSymbolsEffect,
  TSevenWondersEffect,
} from 'common/types/sevenWonders/effects';

import { getAllCombinations } from 'common/utilities/combinations';
import { isScientificSymbolsEffect } from 'common/utilities/sevenWonders';

import Game, { IGameCreateOptions } from 'server/gamesData/Game/Game';

const {
  games: {
    [EGame.SEVEN_WONDERS]: {
      cardsByAge,
      allCities,
    },
  },
} = GAMES_CONFIG;

const ALL_CITIES = Object.values(ESevenWondersCity);

class SevenWondersGame extends Game<EGame.SEVEN_WONDERS> {
  handlers = {
    [ESevenWondersGameEvent.GET_GAME_INFO]: this.onGetGameInfo,
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
      builtWondersIndexes: [],
      coins: 3,
      victoryTokens: [],
      defeatTokens: [],
    };
  }

  createGameInfo(): void {
    const shuffledCities = shuffle(ALL_CITIES);

    times(2, (index) => {
      this.players.push(
        this.createPlayer({
          status: EPlayerStatus.PLAYING,
          login: `bot-${index}`,
        }),
      );
    });

    this.players.forEach((player, playerIndex) => {
      player.city = shuffledCities[playerIndex];

      const citySide = this.getPlayerCitySide(player);

      player.coins += this.calculateEffectGain(citySide.effect, playerIndex)?.coins ?? 0;
    });

    this.startAge();
  }

  startAge(): void {
    this.age++;

    const ageCards = cardsByAge[this.age];
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
    }, []);

    const shuffledCards = chunk(shuffle(usedCards), usedCards.length / this.players.length);

    this.players.forEach((player, index) => {
      player.hand = shuffledCards[index];
    });
  }

  endTurn(): void {
    console.log('end turn');
  }

  endAge(): void {
    if (this.age === 2) {
      this.endGame();

      return;
    }

    this.startAge();
  }

  endGame(): void {
    this.players.forEach((player, playerIndex) => {
      let effects: TSevenWondersEffect[] = [];

      player.builtCards.forEach((card) => {
        effects = [...effects, ...card.effects];
      });

      player.builtWondersIndexes.forEach((wonderIndex) => {
        const citySide = this.getPlayerCitySide(player);

        effects = [...effects, ...citySide.wonders[wonderIndex].effects];
      });

      // effect points
      effects.forEach((effect) => {
        const gain = this.calculateEffectGain(effect, playerIndex);

        player.points += gain?.points ?? 0;
      });

      // war points
      [...player.victoryTokens, ...player.defeatTokens].forEach((points) => {
        player.points += points;
      });

      // science points
      const scientificEffects = effects.filter(isScientificSymbolsEffect);

      player.points += this.calculateScientificEffectsMaxPoints(scientificEffects);

      // coins points
      player.points += Math.floor(player.coins / 3);
    });
  }

  getNeighborIndex(playerIndex: number, neighborDirection: ESevenWondersNeighbor): number {
    return neighborDirection === ESevenWondersNeighbor.LEFT
      ? (playerIndex - 1 + this.players.length) % this.players.length
      : (playerIndex + 1) % this.players.length;
  }

  getDirectionsPlayers(
    playerIndex: number,
    directions: ESevenWondersPlayerDirection[],
  ): ISevenWondersPlayer[] {
    if (directions.includes(ESevenWondersPlayerDirection.ALL)) {
      return this.players;
    }

    return directions.reduce<ISevenWondersPlayer[]>((players, direction) => {
      let addedPlayerIndex = -1;

      if (direction === ESevenWondersPlayerDirection.SELF) {
        addedPlayerIndex = playerIndex;
      } else if (direction === ESevenWondersPlayerDirection.LEFT) {
        addedPlayerIndex = this.getNeighborIndex(playerIndex, ESevenWondersNeighbor.LEFT);
      } else if (direction === ESevenWondersPlayerDirection.RIGHT) {
        addedPlayerIndex = this.getNeighborIndex(playerIndex, ESevenWondersNeighbor.RIGHT);
      }

      return addedPlayerIndex > -1
        ? [...players, this.players[addedPlayerIndex]]
        : players;
    }, []);
  }

  getPlayerCitySide(player: ISevenWondersPlayer): ISevenWondersCitySide {
    return allCities[player.city].sides[player.citySide];
  }

  getPlayerTypeCards(player: ISevenWondersPlayer, cardType: ESevenWondersCardType): ISevenWondersCard[] {
    return player.builtCards.filter((card) => card.type === cardType);
  }

  mergeGains(target: ISevenWondersGain, source: ISevenWondersGain, coefficient: number): void {
    if (source.points) {
      target.points = (target.points ?? 0) + source.points * coefficient;
    }

    if (source.coins) {
      target.coins = (target.coins ?? 0) + source.coins * coefficient;
    }
  }

  calculateEffectGain(effect: TSevenWondersEffect, playerIndex: number): ISevenWondersGain | null {
    switch (effect.type) {
      case ISevenWondersEffect.GAIN: {
        return effect.gain;
      }

      case ISevenWondersEffect.CARDS_TYPE: {
        const gain: ISevenWondersGain = {};

        this.getDirectionsPlayers(playerIndex, effect.directions).forEach((player) => {
          effect.sources.forEach((source) => {
            const cardTypeCardCounts = source.cardTypes.map((cardType) => {
              return this.getPlayerTypeCards(player, cardType).length;
            });
            const setsCount = Math.min(...cardTypeCardCounts);

            this.mergeGains(gain, source.gain, setsCount);
          });
        });

        return gain;
      }

      case ISevenWondersEffect.WONDER_LEVELS: {
        const gain: ISevenWondersGain = {};

        this.getDirectionsPlayers(playerIndex, effect.directions).forEach((player) => {
          this.mergeGains(gain, effect.gain, player.builtWondersIndexes.length);
        });

        return gain;
      }

      case ISevenWondersEffect.WINS: {
        const gain: ISevenWondersGain = {};

        this.getDirectionsPlayers(playerIndex, effect.directions).forEach((player) => {
          this.mergeGains(gain, effect.gain, player.victoryTokens.length);
        });

        return gain;
      }

      case ISevenWondersEffect.LOSSES: {
        const gain: ISevenWondersGain = {};

        this.getDirectionsPlayers(playerIndex, effect.directions).forEach((player) => {
          this.mergeGains(gain, effect.gain, player.defeatTokens.length);
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

    return symbolsCombinations.reduce((maxScore, symbols) => {
      return Math.max(maxScore, this.calculateScientificCardsPoints(symbols));
    }, -1);
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

  onGetGameInfo({ socket }: IGameEvent): void {
    socket.emit(ESevenWondersGameEvent.GAME_INFO, this.getGameInfoEvent());
  }

  getGameInfoEvent(): ISevenWondersGameInfoEvent {
    return {
      players: this.players,
      discard: this.discard,
    };
  }

  deleteGame(): void {
    super.deleteGame();
  }
}

export default SevenWondersGame;
