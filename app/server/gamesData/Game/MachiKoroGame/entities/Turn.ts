import random from 'lodash/random';
import sortBy from 'lodash/sortBy';
import times from 'lodash/times';
import sum from 'lodash/sum';

import { EGame } from 'common/types/game';
import {
  ECardColor,
  ECardId,
  ECardType,
  EGameClientEvent,
  EGameServerEvent,
  ELandmarkId,
  EPlayerWaitingAction,
  ICard,
  IPlayerData,
  ITurn,
} from 'common/types/machiKoro';

import { TGenerator } from 'server/gamesData/Game/utilities/Entity';
import ServerEntity from 'server/gamesData/Game/utilities/ServerEntity';
import getCard from 'common/utilities/machiKoro/getCard';
import getLandmark from 'common/utilities/machiKoro/getLandmark';

import MachiKoroGame from 'server/gamesData/Game/MachiKoroGame/MachiKoroGame';

const CARDS_PRIORITY = [ECardColor.RED, ECardColor.BLUE, ECardColor.GREEN, ECardColor.PURPLE];

function getCards(cardsIds: ECardId[]): ICard[] {
  return cardsIds.map(getCard);
}

function getActivatedCardsByPriority(dicesSum: number, cards: ICard[], isActive: boolean): ICard[] {
  const activatedCards = cards.filter(
    (card) =>
      card.dice.includes(dicesSum) &&
      (card.color === ECardColor.BLUE ||
        (!isActive && card.color === ECardColor.RED) ||
        (isActive && (card.color === ECardColor.GREEN || card.color === ECardColor.PURPLE))),
  );

  return sortBy(activatedCards, (card) => CARDS_PRIORITY.indexOf(card.color));
}

function getCardTypeCount(cardsIds: ECardId[], type: ECardType): number {
  return getCards(cardsIds).filter((card) => card.type === type).length;
}

function getCardIdCount(cardsIds: ECardId[], id: ECardId): number {
  return getCards(cardsIds).filter((card) => card.id === id).length;
}

function getShopsAndRestaurantIncreasedIncome(player: IPlayerData): number {
  const withShoppingMall = player.landmarksIds.includes(ELandmarkId.SHOPPING_MALL);

  return withShoppingMall ? 1 : 0;
}

export default class Turn extends ServerEntity<EGame.MACHI_KORO> {
  game: MachiKoroGame;

  dices: number[] = [];
  withHarborEffect = false;
  waitingAction: EPlayerWaitingAction | null = null;

  constructor(game: MachiKoroGame) {
    super(game);

    this.game = game;
  }

  *lifecycle(): TGenerator {
    const activePlayer = this.game.playersData[this.game.activePlayerIndex];
    const withCityHall = activePlayer.landmarksIds.includes(ELandmarkId.CITY_HALL);
    const withHarbor = activePlayer.landmarksIds.includes(ELandmarkId.HARBOR);
    const withAmusementPark = activePlayer.landmarksIds.includes(ELandmarkId.AMUSEMENT_PARK);
    const withAirport = activePlayer.landmarksIds.includes(ELandmarkId.AIRPORT);

    while (this.dices.length === 0 || (withAmusementPark && this.dices[0] === this.dices[1])) {
      this.withHarborEffect = false;

      let canRerollDices = activePlayer.landmarksIds.includes(ELandmarkId.RADIO_TOWER);

      while (true) {
        const withTrainStation = activePlayer.landmarksIds.includes(ELandmarkId.TRAIN_STATION);

        let dicesCount = 1;

        if (withTrainStation) {
          this.setWaitingAction(EPlayerWaitingAction.CHOOSE_DICES_COUNT);

          dicesCount = yield* this.waitForPlayerSocketEvent(EGameClientEvent.DICES_COUNT, {
            playerIndex: this.game.activePlayerIndex,
          });

          this.clearWaitingAction();
        }

        this.dices = times(dicesCount, () => random(1, 6));

        this.sendSocketEvent(EGameServerEvent.DICES_ROLL, this.dices);

        if (!canRerollDices) {
          break;
        }

        this.setWaitingAction(EPlayerWaitingAction.CHOOSE_NEED_TO_REROLL);

        const needToReroll = yield* this.waitForPlayerSocketEvent(EGameClientEvent.NEED_TO_REROLL, {
          playerIndex: this.game.activePlayerIndex,
        });

        this.clearWaitingAction();

        if (!needToReroll) {
          break;
        }

        canRerollDices = false;
      }

      let dicesSum = sum(this.dices);

      if (withHarbor && dicesSum >= 10) {
        this.setWaitingAction(EPlayerWaitingAction.CHOOSE_NEED_TO_USE_HARBOR);

        this.withHarborEffect = yield* this.waitForPlayerSocketEvent(EGameClientEvent.NEED_TO_USE_HARBOR, {
          playerIndex: this.game.activePlayerIndex,
        });

        this.clearWaitingAction();

        if (this.withHarborEffect) {
          dicesSum += 2;
        }

        this.sendSocketEvent(EGameServerEvent.HARBOR_EFFECT, this.withHarborEffect);
      }

      for (let i = 0; i < this.playersCount; i++) {
        const tempPlayerIndex = this.game.activePlayerIndex - i - 1;
        const playerIndex = tempPlayerIndex < 0 ? this.playersCount + tempPlayerIndex : tempPlayerIndex;
        const player = this.game.playersData[playerIndex];
        const cards = getCards(player.cardsIds);

        const activatedCards = getActivatedCardsByPriority(
          dicesSum,
          cards,
          playerIndex === this.game.activePlayerIndex,
        );

        yield* this.runCardsEffects(activatedCards, this.game.playersData, playerIndex, this.game.activePlayerIndex);
      }

      if (withCityHall && activePlayer.coins === 0) {
        activePlayer.coins = 1;
      }

      this.sendSocketEvent(EGameServerEvent.CARDS_EFFECTS_RESULTS, { players: this.game.getGamePlayers() });

      const { event, data } = yield* this.waitForPlayerSocketEvents(
        [EGameClientEvent.BUILD_CARD, EGameClientEvent.BUILD_LANDMARK, EGameClientEvent.END_TURN],
        {
          playerIndex: this.game.activePlayerIndex,
        },
      );

      if (event === EGameClientEvent.END_TURN) {
        if (withAirport) {
          activePlayer.coins += 10;

          this.sendSocketEvent(EGameServerEvent.UPDATE_PLAYERS, this.game.getGamePlayers());
        }

        continue;
      }

      if (event === EGameClientEvent.BUILD_LANDMARK) {
        const landmarkId = data;

        const landmark = getLandmark(landmarkId);

        activePlayer.coins -= landmark.cost;
        activePlayer.landmarksIds.push(landmarkId);

        this.sendSocketEvent(EGameServerEvent.BUILD_LANDMARK, {
          players: this.game.getGamePlayers(),
        });

        if (this.game.getWinnerIndex() !== -1) {
          return;
        }

        continue;
      }

      const cardId = data;

      const card = getCard(cardId);

      this.game.pickCardAndFillBoard(cardId);

      activePlayer.coins -= card.cost;
      activePlayer.cardsIds.push(cardId);

      this.sendSocketEvent(EGameServerEvent.BUILD_CARD, {
        players: this.game.getGamePlayers(),
        board: this.game.board,
      });
    }
  }

  clearWaitingAction(): void {
    this.setWaitingAction(null);
  }

  *runCardsEffects(cards: ICard[], players: IPlayerData[], playerIndex: number, activePlayerIndex: number): TGenerator {
    const player = players[playerIndex];
    const activePlayer = players[activePlayerIndex];

    const withHarbor = player.landmarksIds.includes(ELandmarkId.HARBOR);
    const shopsAndRestaurantIncreasedIncome = getShopsAndRestaurantIncreasedIncome(player);

    for (const card of cards) {
      if (card.id === ECardId.SUSHI_BAR) {
        if (!withHarbor) {
          continue;
        }

        const coins = Math.min(activePlayer.coins, 3 + shopsAndRestaurantIncreasedIncome);

        activePlayer.coins -= coins;
        player.coins += coins;
      } else if (card.id === ECardId.CAFE || card.id === ECardId.PIZZA_JOINT || card.id === ECardId.HAMBURGER_STAND) {
        const coins = Math.min(activePlayer.coins, 1 + shopsAndRestaurantIncreasedIncome);

        activePlayer.coins -= coins;
        player.coins += coins;
      } else if (card.id === ECardId.RESTAURANT) {
        const coins = Math.min(activePlayer.coins, 2 + shopsAndRestaurantIncreasedIncome);

        activePlayer.coins -= coins;
        player.coins += coins;
      } else if (card.id === ECardId.BAKERY) {
        player.coins += 1 + shopsAndRestaurantIncreasedIncome;
      } else if (card.id === ECardId.CONVENIENCE_STORE) {
        player.coins += 3 + shopsAndRestaurantIncreasedIncome;
      } else if (card.id === ECardId.FLOWER_SHOP) {
        const flowerGardensCount = getCardIdCount(player.cardsIds, ECardId.FLOWER_GARDEN);

        player.coins += (1 + shopsAndRestaurantIncreasedIncome) * flowerGardensCount;
      } else if (card.id === ECardId.CHEESE_FACTORY) {
        const farmsCount = getCardTypeCount(player.cardsIds, ECardType.FARM);

        player.coins += 3 * farmsCount;
      } else if (card.id === ECardId.FURNITURE_FACTORY) {
        const gearsCount = getCardTypeCount(player.cardsIds, ECardType.GEAR);

        player.coins += 3 * gearsCount;
      } else if (card.id === ECardId.PRODUCE_MARKET) {
        const wheatCount = getCardTypeCount(player.cardsIds, ECardType.WHEAT);

        player.coins += 2 * wheatCount;
      } else if (card.id === ECardId.FOOD_WAREHOUSE) {
        const restaurantsCount = getCardTypeCount(player.cardsIds, ECardType.RESTAURANT);

        player.coins += 2 * restaurantsCount;
      } else if (
        card.id === ECardId.WHEAT_FIELD ||
        card.id === ECardId.LIVESTOCK_FARM ||
        card.id === ECardId.FOREST ||
        card.id === ECardId.FLOWER_GARDEN
      ) {
        player.coins += 1;
      } else if (card.id === ECardId.MACKEREL_BOAT) {
        if (!withHarbor) {
          continue;
        }

        player.coins += 3;
      } else if (card.id === ECardId.MINE) {
        player.coins += 5;
      } else if (card.id === ECardId.APPLE_ORCHARD) {
        player.coins += 3;
      } else if (card.id === ECardId.TUNA_BOAT) {
        if (!withHarbor) {
          continue;
        }

        player.coins += sum([random(1, 6), random(1, 6)]);
      } else if (card.id === ECardId.STADIUM) {
        players.forEach((localPlayer, localPlayerIndex) => {
          if (localPlayerIndex === activePlayerIndex) {
            return;
          }

          const coins = Math.min(localPlayer.coins, 2);

          localPlayer.coins -= coins;
          activePlayer.coins += coins;
        });
      } else if (card.id === ECardId.TV_STATION) {
        this.setWaitingAction(EPlayerWaitingAction.CHOOSE_PLAYER);

        const selectedPlayerIndex = yield* this.waitForPlayerSocketEvent(EGameClientEvent.CHOOSE_PLAYER, {
          playerIndex: this.game.activePlayerIndex,
        });

        this.clearWaitingAction();

        const selectedPlayer = players[selectedPlayerIndex];
        const coins = Math.min(selectedPlayer.coins, 5);

        selectedPlayer.coins -= coins;
        activePlayer.coins += coins;
      } else if (card.id === ECardId.BUSINESS_COMPLEX) {
        this.setWaitingAction(EPlayerWaitingAction.CHOOSE_CARDS_TO_SWAP);

        const { from, toCardId } = yield* this.waitForPlayerSocketEvent(EGameClientEvent.CARDS_TO_SWAP, {
          playerIndex: this.game.activePlayerIndex,
        });

        this.clearWaitingAction();

        const fromPlayer = players[from.playerIndex];

        activePlayer.cardsIds.splice(activePlayer.cardsIds.indexOf(toCardId), 1);
        fromPlayer.cardsIds.splice(fromPlayer.cardsIds.indexOf(from.cardId), 1);

        activePlayer.cardsIds.push(from.cardId);
        fromPlayer.cardsIds.push(toCardId);
      } else if (card.id === ECardId.PUBLISHER) {
        this.setWaitingAction(EPlayerWaitingAction.CHOOSE_PUBLISHER_TARGET);

        const publisherTarget = yield* this.waitForPlayerSocketEvent(EGameClientEvent.PUBLISHER_TARGET, {
          playerIndex: this.game.activePlayerIndex,
        });

        this.clearWaitingAction();

        players.forEach((localPlayer, localPlayerIndex) => {
          if (localPlayerIndex === activePlayerIndex) {
            return;
          }

          const targetCount = getCardTypeCount(localPlayer.cardsIds, publisherTarget);

          const coins = Math.min(localPlayer.coins, targetCount);

          localPlayer.coins -= coins;
          activePlayer.coins += coins;
        });
      } else if (card.id === ECardId.TAX_OFFICE) {
        players.forEach((localPlayer, localPlayerIndex) => {
          if (localPlayerIndex === activePlayerIndex) {
            return;
          }

          const coins = localPlayer.coins >= 10 ? Math.floor(localPlayer.coins / 2) : 0;

          localPlayer.coins -= coins;
          activePlayer.coins += coins;
        });
      }
    }
  }

  setWaitingAction(waitingAction: EPlayerWaitingAction | null): void {
    this.waitingAction = waitingAction;

    this.sendSocketEvent(EGameServerEvent.WAIT_ACTION, waitingAction);
  }

  toJSON(): ITurn {
    return {
      dices: this.dices,
      withHarborEffect: this.withHarborEffect,
      waitingAction: this.waitingAction,
    };
  }
}
