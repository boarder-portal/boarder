import random from 'lodash/random';
import sortBy from 'lodash/sortBy';
import sum from 'lodash/sum';
import times from 'lodash/times';

import { GameType } from 'common/types/game';
import {
  Card,
  CardColor,
  CardId,
  CardType,
  GameClientEventType,
  GameServerEventType,
  LandmarkId,
  PlayerData,
  PlayerWaitingActionType,
  Turn as TurnModel,
} from 'common/types/games/machiKoro';

import getCard from 'common/utilities/games/machiKoro/getCard';
import getLandmark from 'common/utilities/games/machiKoro/getLandmark';
import Entity, { EntityGenerator } from 'server/gamesData/Game/utilities/Entity/Entity';
import GameInfo from 'server/gamesData/Game/utilities/Entity/components/GameInfo';
import Server from 'server/gamesData/Game/utilities/Entity/components/Server';

import MachiKoroGame from 'server/gamesData/Game/MachiKoroGame/MachiKoroGame';

const CARDS_PRIORITY = [CardColor.RED, CardColor.BLUE, CardColor.GREEN, CardColor.PURPLE];

function getCards(cardsIds: CardId[]): Card[] {
  return cardsIds.map(getCard);
}

function getActivatedCardsByPriority(dicesSum: number, cards: Card[], isActive: boolean): Card[] {
  const activatedCards = cards.filter(
    (card) =>
      card.dice.includes(dicesSum) &&
      (card.color === CardColor.BLUE ||
        (!isActive && card.color === CardColor.RED) ||
        (isActive && (card.color === CardColor.GREEN || card.color === CardColor.PURPLE))),
  );

  return sortBy(activatedCards, (card) => CARDS_PRIORITY.indexOf(card.color));
}

function getCardTypeCount(cardsIds: CardId[], type: CardType): number {
  return getCards(cardsIds).filter((card) => card.type === type).length;
}

function getCardIdCount(cardsIds: CardId[], id: CardId): number {
  return getCards(cardsIds).filter((card) => card.id === id).length;
}

function getShopsAndRestaurantIncreasedIncome(player: PlayerData): number {
  const withShoppingMall = player.landmarksIds.includes(LandmarkId.SHOPPING_MALL);

  return withShoppingMall ? 1 : 0;
}

export default class Turn extends Entity {
  game = this.getClosestEntity(MachiKoroGame);

  gameInfo = this.obtainComponent(GameInfo<GameType.MACHI_KORO, this>);
  server = this.obtainComponent(Server<GameType.MACHI_KORO, this>);

  dices: number[] = [];
  withHarborEffect = false;
  waitingAction: PlayerWaitingActionType | null = null;
  turnController = this.game.turnController;
  gamePlayersData = this.game.playersData;

  *lifecycle(): EntityGenerator {
    const activePlayer = this.gamePlayersData.getActive();
    const withCityHall = activePlayer.landmarksIds.includes(LandmarkId.CITY_HALL);
    const withHarbor = activePlayer.landmarksIds.includes(LandmarkId.HARBOR);
    const withAmusementPark = activePlayer.landmarksIds.includes(LandmarkId.AMUSEMENT_PARK);
    const withAirport = activePlayer.landmarksIds.includes(LandmarkId.AIRPORT);

    while (this.dices.length === 0 || (withAmusementPark && this.dices[0] === this.dices[1])) {
      this.withHarborEffect = false;

      let canRerollDices = activePlayer.landmarksIds.includes(LandmarkId.RADIO_TOWER);

      while (true) {
        const withTrainStation = activePlayer.landmarksIds.includes(LandmarkId.TRAIN_STATION);

        let dicesCount = 1;

        if (withTrainStation) {
          this.setWaitingAction(PlayerWaitingActionType.CHOOSE_DICES_COUNT);

          dicesCount = yield* this.server.waitForActivePlayerSocketEvent(GameClientEventType.DICES_COUNT);

          this.clearWaitingAction();
        }

        this.dices = times(dicesCount, () => random(1, 6));

        this.server.sendSocketEvent(GameServerEventType.DICES_ROLL, this.dices);

        if (!canRerollDices) {
          break;
        }

        this.setWaitingAction(PlayerWaitingActionType.CHOOSE_NEED_TO_REROLL);

        const needToReroll = yield* this.server.waitForActivePlayerSocketEvent(GameClientEventType.NEED_TO_REROLL);

        this.clearWaitingAction();

        if (!needToReroll) {
          break;
        }

        canRerollDices = false;
      }

      let dicesSum = sum(this.dices);

      if (withHarbor && dicesSum >= 10) {
        this.setWaitingAction(PlayerWaitingActionType.CHOOSE_NEED_TO_USE_HARBOR);

        this.withHarborEffect = yield* this.server.waitForActivePlayerSocketEvent(
          GameClientEventType.NEED_TO_USE_HARBOR,
        );

        this.clearWaitingAction();

        if (this.withHarborEffect) {
          dicesSum += 2;
        }

        this.server.sendSocketEvent(GameServerEventType.HARBOR_EFFECT, this.withHarborEffect);
      }

      for (let i = 0; i < this.gameInfo.playersCount; i++) {
        const tempPlayerIndex = this.turnController.activePlayerIndex - i - 1;
        const playerIndex = tempPlayerIndex < 0 ? this.gameInfo.playersCount + tempPlayerIndex : tempPlayerIndex;
        const player = this.gamePlayersData.get(playerIndex);
        const cards = getCards(player.cardsIds);

        const activatedCards = getActivatedCardsByPriority(
          dicesSum,
          cards,
          playerIndex === this.turnController.activePlayerIndex,
        );

        yield* this.runCardsEffects(activatedCards, playerIndex);
      }

      if (withCityHall && activePlayer.coins === 0) {
        activePlayer.coins = 1;
      }

      this.server.sendSocketEvent(GameServerEventType.CARDS_EFFECTS_RESULTS, {
        players: this.game.getGamePlayers(),
      });

      const { event, data } = yield* this.server.waitForActivePlayerSocketEvents([
        GameClientEventType.BUILD_CARD,
        GameClientEventType.BUILD_LANDMARK,
        GameClientEventType.END_TURN,
      ]);

      if (event === GameClientEventType.END_TURN) {
        if (withAirport) {
          activePlayer.coins += 10;

          this.server.sendSocketEvent(GameServerEventType.UPDATE_PLAYERS, this.game.getGamePlayers());
        }

        continue;
      }

      if (event === GameClientEventType.BUILD_LANDMARK) {
        const landmarkId = data;

        const landmark = getLandmark(landmarkId);

        activePlayer.coins -= landmark.cost;
        activePlayer.landmarksIds.push(landmarkId);

        this.server.sendSocketEvent(GameServerEventType.BUILD_LANDMARK, {
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

      this.server.sendSocketEvent(GameServerEventType.BUILD_CARD, {
        players: this.game.getGamePlayers(),
        board: this.game.board,
      });
    }
  }

  clearWaitingAction(): void {
    this.setWaitingAction(null);
  }

  *runCardsEffects(cards: Card[], playerIndex: number): EntityGenerator {
    const player = this.gamePlayersData.get(playerIndex);
    const activePlayer = this.gamePlayersData.getActive();

    const withHarbor = player.landmarksIds.includes(LandmarkId.HARBOR);
    const shopsAndRestaurantIncreasedIncome = getShopsAndRestaurantIncreasedIncome(player);

    for (const card of cards) {
      if (card.id === CardId.SUSHI_BAR) {
        if (!withHarbor) {
          continue;
        }

        const coins = Math.min(activePlayer.coins, 3 + shopsAndRestaurantIncreasedIncome);

        activePlayer.coins -= coins;
        player.coins += coins;
      } else if (card.id === CardId.CAFE || card.id === CardId.PIZZA_JOINT || card.id === CardId.HAMBURGER_STAND) {
        const coins = Math.min(activePlayer.coins, 1 + shopsAndRestaurantIncreasedIncome);

        activePlayer.coins -= coins;
        player.coins += coins;
      } else if (card.id === CardId.RESTAURANT) {
        const coins = Math.min(activePlayer.coins, 2 + shopsAndRestaurantIncreasedIncome);

        activePlayer.coins -= coins;
        player.coins += coins;
      } else if (card.id === CardId.BAKERY) {
        player.coins += 1 + shopsAndRestaurantIncreasedIncome;
      } else if (card.id === CardId.CONVENIENCE_STORE) {
        player.coins += 3 + shopsAndRestaurantIncreasedIncome;
      } else if (card.id === CardId.FLOWER_SHOP) {
        const flowerGardensCount = getCardIdCount(player.cardsIds, CardId.FLOWER_GARDEN);

        player.coins += (1 + shopsAndRestaurantIncreasedIncome) * flowerGardensCount;
      } else if (card.id === CardId.CHEESE_FACTORY) {
        const farmsCount = getCardTypeCount(player.cardsIds, CardType.FARM);

        player.coins += 3 * farmsCount;
      } else if (card.id === CardId.FURNITURE_FACTORY) {
        const gearsCount = getCardTypeCount(player.cardsIds, CardType.GEAR);

        player.coins += 3 * gearsCount;
      } else if (card.id === CardId.PRODUCE_MARKET) {
        const wheatCount = getCardTypeCount(player.cardsIds, CardType.WHEAT);

        player.coins += 2 * wheatCount;
      } else if (card.id === CardId.FOOD_WAREHOUSE) {
        const restaurantsCount = getCardTypeCount(player.cardsIds, CardType.RESTAURANT);

        player.coins += 2 * restaurantsCount;
      } else if (
        card.id === CardId.WHEAT_FIELD ||
        card.id === CardId.LIVESTOCK_FARM ||
        card.id === CardId.FOREST ||
        card.id === CardId.FLOWER_GARDEN
      ) {
        player.coins += 1;
      } else if (card.id === CardId.MACKEREL_BOAT) {
        if (!withHarbor) {
          continue;
        }

        player.coins += 3;
      } else if (card.id === CardId.MINE) {
        player.coins += 5;
      } else if (card.id === CardId.APPLE_ORCHARD) {
        player.coins += 3;
      } else if (card.id === CardId.TUNA_BOAT) {
        if (!withHarbor) {
          continue;
        }

        player.coins += sum([random(1, 6), random(1, 6)]);
      } else if (card.id === CardId.STADIUM) {
        this.gamePlayersData.forEach((localPlayer, localPlayerIndex) => {
          if (localPlayerIndex === this.turnController.activePlayerIndex) {
            return;
          }

          const coins = Math.min(localPlayer.coins, 2);

          localPlayer.coins -= coins;
          activePlayer.coins += coins;
        });
      } else if (card.id === CardId.TV_STATION) {
        this.setWaitingAction(PlayerWaitingActionType.CHOOSE_PLAYER);

        const selectedPlayerIndex = yield* this.server.waitForActivePlayerSocketEvent(
          GameClientEventType.CHOOSE_PLAYER,
        );

        this.clearWaitingAction();

        const selectedPlayer = this.gamePlayersData.get(selectedPlayerIndex);
        const coins = Math.min(selectedPlayer.coins, 5);

        selectedPlayer.coins -= coins;
        activePlayer.coins += coins;
      } else if (card.id === CardId.BUSINESS_COMPLEX) {
        this.setWaitingAction(PlayerWaitingActionType.CHOOSE_CARDS_TO_SWAP);

        const { from, toCardId } = yield* this.server.waitForActivePlayerSocketEvent(GameClientEventType.CARDS_TO_SWAP);

        this.clearWaitingAction();

        const fromPlayer = this.gamePlayersData.get(from.playerIndex);

        activePlayer.cardsIds.splice(activePlayer.cardsIds.indexOf(toCardId), 1);
        fromPlayer.cardsIds.splice(fromPlayer.cardsIds.indexOf(from.cardId), 1);

        activePlayer.cardsIds.push(from.cardId);
        fromPlayer.cardsIds.push(toCardId);
      } else if (card.id === CardId.PUBLISHER) {
        this.setWaitingAction(PlayerWaitingActionType.CHOOSE_PUBLISHER_TARGET);

        const publisherTarget = yield* this.server.waitForActivePlayerSocketEvent(GameClientEventType.PUBLISHER_TARGET);

        this.clearWaitingAction();

        this.gamePlayersData.forEach((localPlayer, localPlayerIndex) => {
          if (localPlayerIndex === this.turnController.activePlayerIndex) {
            return;
          }

          const targetCount = getCardTypeCount(localPlayer.cardsIds, publisherTarget);

          const coins = Math.min(localPlayer.coins, targetCount);

          localPlayer.coins -= coins;
          activePlayer.coins += coins;
        });
      } else if (card.id === CardId.TAX_OFFICE) {
        this.gamePlayersData.forEach((localPlayer, localPlayerIndex) => {
          if (localPlayerIndex === this.turnController.activePlayerIndex) {
            return;
          }

          const coins = localPlayer.coins >= 10 ? Math.floor(localPlayer.coins / 2) : 0;

          localPlayer.coins -= coins;
          activePlayer.coins += coins;
        });
      }
    }
  }

  setWaitingAction(waitingAction: PlayerWaitingActionType | null): void {
    this.waitingAction = waitingAction;

    this.server.sendSocketEvent(GameServerEventType.WAIT_ACTION, waitingAction);
  }

  toJSON(): TurnModel {
    return {
      dices: this.dices,
      withHarborEffect: this.withHarborEffect,
      waitingAction: this.waitingAction,
    };
  }
}
