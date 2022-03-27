import shuffle from 'lodash/shuffle';
import chunk from 'lodash/chunk';
import times from 'lodash/times';
import { last } from 'lodash';

import { GAMES_CONFIG } from 'common/constants/gamesConfig';

import { IGameEvent } from 'server/types';
import { EGame } from 'common/types/game';
import { EPlayerStatus, IPlayer } from 'common/types';
import {
  ESevenWondersCardActionType,
  ESevenWondersCity,
  ESevenWondersGameEvent,
  ESevenWondersNeighborSide,
  ESevenWondersScientificSymbol,
  ISevenWondersBuildCardEvent,
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
import { isShieldsEffect, isScientificSymbolsEffect } from 'common/utilities/sevenWonders/isEffect';
import getNeighbor from 'common/utilities/sevenWonders/getNeighbor';
import getAllPlayerEffects from 'common/utilities/sevenWonders/getAllPlayerEffects';
import getCity from 'common/utilities/sevenWonders/getCity';

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
const BOTS_COUNT = 4;

class SevenWondersGame extends Game<EGame.SEVEN_WONDERS> {
  handlers = {
    [ESevenWondersGameEvent.GET_GAME_INFO]: this.onGetGameInfo,
    [ESevenWondersGameEvent.BUILD_CARD]: this.onBuildCard,
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
      buildStages: [],
      coins: 3,
      victoryPoints: [],
      defeatPoints: [],
      isBot: false,
      chosenMainAction: null,
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
    const neighborSide = this.getAgeNeighborSide();

    this.players.forEach((player) => {
      if (player.isBot) {
        // TODO: строить карточку, которую может построить
        const builtCard = player.hand.pop();

        if (builtCard) {
          player.builtCards.push(builtCard);
        }
      }
    });

    const hands = this.players.map(({ hand }) => hand);

    this.players.forEach((player, playerIndex) => {
      player.chosenMainAction = null;

      const neighbor = this.getNeighbor(player, neighborSide);

      neighbor.hand = hands[playerIndex];
    });

    if (this.players.some(({ hand }) => hand.length === 1)) {
      this.endAge();
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
    });

    if (this.age === 0) {
      this.endGame();
    } else {
      this.startAge();
    }
  }

  endGame(): void {
    this.players.forEach((player) => {
      const effects = getAllPlayerEffects(player);

      // effect points
      effects.forEach((effect) => {
        const gain = this.calculateEffectGain(effect, player);

        player.points += gain?.points ?? 0;
      });

      // war points
      [...player.victoryPoints, ...player.defeatPoints].forEach((points) => {
        player.points += points;
      });

      // science points
      const scientificEffects = effects.filter(isScientificSymbolsEffect);

      player.points += this.calculateScientificEffectsMaxPoints(scientificEffects);

      // coins points
      player.points += Math.floor(player.coins / 3);
    });
  }

  getAgeNeighborSide(): ESevenWondersNeighborSide {
    return this.age % 2
      ? ESevenWondersNeighborSide.LEFT
      : ESevenWondersNeighborSide.RIGHT;
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

        this.getDirectionsPlayers(player, effect.directions).forEach((player) => {
          this.mergeGains(gain, effect.gain, player.buildStages.length);
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

  sendGameInfo(): void {
    this.io.emit(ESevenWondersGameEvent.GAME_INFO, this.getGameInfoEvent());
  }

  onGetGameInfo({ socket }: IGameEvent): void {
    socket.emit(ESevenWondersGameEvent.GAME_INFO, this.getGameInfoEvent());
  }

  onBuildCard({ socket, data }: IGameEvent<ISevenWondersBuildCardEvent>): void {
    const player = this.getPlayerByLogin(socket.user?.login);

    if (!player) {
      return;
    }

    const { card, action, payments } = data;

    const newEffects: TSevenWondersEffect[] = [];

    if (action.type === ESevenWondersCardActionType.BUILD_STRUCTURE) {
      player.builtCards.push(card);
      player.coins -= card.price?.coins || 0;

      newEffects.push(...card.effects);
    } else if (action.type === ESevenWondersCardActionType.BUILD_WONDER_STAGE) {
      const city = getCity(player.city, player.citySide);
      const wonderLevel = city.wonders[player.buildStages.length];

      player.buildStages.push({
        index: action.stageIndex,
        card,
      });
      player.coins -= wonderLevel.price.coins || 0;

      newEffects.push(...wonderLevel.effects);
    } else if (action.type === ESevenWondersCardActionType.DISCARD) {
      player.coins += 3;

      this.discard.push(card);
    }

    const handCardIndex = player.hand.findIndex(({ id }) => id === card.id);

    player.hand.splice(handCardIndex, 1);
    player.chosenMainAction = action;

    (
      Object.entries(payments || {}) as [ESevenWondersNeighborSide, number][]
    ).forEach(([neighborSide, payment]) => {
      const neighbor = this.getNeighbor(player, neighborSide);

      neighbor.coins += payment;
      player.coins -= payment;
    });

    newEffects.forEach((effect) => {
      player.coins += this.calculateEffectGain(effect, player)?.coins ?? 0;
    });

    if (this.players.every((p) => p.chosenMainAction || p.isBot)) {
      this.endTurn();
    }
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
