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
} from 'common/types/machiKoro';

import { TGenerator } from 'server/gamesData/Game/utilities/Entity';
import ServerEntity from 'server/gamesData/Game/utilities/ServerEntity';
import getCard from 'common/utilities/machiKoro/getCard';
import isLandmark from 'common/utilities/machiKoro/isLandmark';
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
  const withShoppingMol = player.landmarksIds.includes(ELandmarkId.SHOPPING_MALL);

  return withShoppingMol ? 1 : 0;
}

export default class Turn extends ServerEntity<EGame.MACHI_KORO> {
  game: MachiKoroGame;
  withHarborEffect = false;

  constructor(game: MachiKoroGame) {
    super(game);

    this.game = game;
  }

  *lifecycle(): TGenerator {
    let dices: number[] = [];

    const activePlayer = this.game.playersData[this.game.activePlayerIndex];
    const withCityHall = activePlayer.landmarksIds.includes(ELandmarkId.CITY_HALL);
    const withHarbor = activePlayer.landmarksIds.includes(ELandmarkId.HARBOR);
    const withAmusementPark = activePlayer.landmarksIds.includes(ELandmarkId.AMUSEMENT_PARK);
    const withAirport = activePlayer.landmarksIds.includes(ELandmarkId.AIRPORT);
    let canRerollDices = activePlayer.landmarksIds.includes(ELandmarkId.RADIO_TOWER);

    while (dices.length === 0 || (withAmusementPark && dices[0] === dices[1])) {
      this.withHarborEffect = false;

      while (true) {
        const withTrainStation = activePlayer.landmarksIds.includes(ELandmarkId.TRAIN_STATION);

        let dicesCount = 1;

        if (withTrainStation) {
          activePlayer.waitingAction = EPlayerWaitingAction.CHOOSE_DICES_COUNT;

          this.sendSocketEvent(EGameServerEvent.WAIT_ACTION, {
            players: this.game.getGamePlayers(),
          });

          dicesCount = yield* this.waitForPlayerSocketEvent(EGameClientEvent.DICES_COUNT, {
            playerIndex: this.game.activePlayerIndex,
          });

          activePlayer.waitingAction = null;

          this.sendSocketEvent(EGameServerEvent.UPDATE_PLAYERS, this.game.getGamePlayers());
        }

        this.game.dices = dices = times(dicesCount, () => random(1, 6));

        this.sendSocketEvent(EGameServerEvent.DICES_ROLL, dices);

        if (canRerollDices) {
          activePlayer.waitingAction = EPlayerWaitingAction.CHOOSE_NEED_TO_REROLL;

          this.sendSocketEvent(EGameServerEvent.WAIT_ACTION, {
            players: this.game.getGamePlayers(),
          });

          const needToReroll = yield* this.waitForPlayerSocketEvent(EGameClientEvent.NEED_TO_REROLL, {
            playerIndex: this.game.activePlayerIndex,
          });

          activePlayer.waitingAction = null;

          this.sendSocketEvent(EGameServerEvent.UPDATE_PLAYERS, this.game.getGamePlayers());

          if (!needToReroll) {
            break;
          }

          canRerollDices = false;
        } else {
          break;
        }
      }

      let dicesSum = sum(dices);

      if (withHarbor && dicesSum >= 10) {
        activePlayer.waitingAction = EPlayerWaitingAction.CHOOSE_NEED_TO_USE_HARBOR;

        this.sendSocketEvent(EGameServerEvent.WAIT_ACTION, {
          players: this.game.getGamePlayers(),
        });

        this.withHarborEffect = yield* this.waitForPlayerSocketEvent(EGameClientEvent.NEED_TO_USE_HARBOR, {
          playerIndex: this.game.activePlayerIndex,
        });

        activePlayer.waitingAction = null;

        if (this.withHarborEffect) {
          dicesSum += 2;
        }

        this.sendSocketEvent(EGameServerEvent.HARBOR_EFFECT, {
          players: this.game.getGamePlayers(),
          withEffect: this.withHarborEffect,
        });
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

      const data = yield* this.race([
        this.waitForPlayerSocketEvent(EGameClientEvent.BUILD_CARD, {
          playerIndex: this.game.activePlayerIndex,
        }),
        this.waitForPlayerSocketEvent(EGameClientEvent.BUILD_LANDMARK, {
          playerIndex: this.game.activePlayerIndex,
        }),
        this.waitForPlayerSocketEvent(EGameClientEvent.END_TURN, {
          playerIndex: this.game.activePlayerIndex,
        }),
      ]);

      if (!data) {
        if (withAirport) {
          activePlayer.coins += 10;

          this.sendSocketEvent(EGameServerEvent.UPDATE_PLAYERS, this.game.getGamePlayers());
        }

        continue;
      }

      if (isLandmark(data)) {
        const landmarkId = data;

        const landmark = getLandmark(landmarkId);

        activePlayer.coins -= landmark.cost;
        activePlayer.landmarksIds.push(landmarkId);

        this.sendSocketEvent(EGameServerEvent.BUILD_LANDMARK, {
          players: this.game.getGamePlayers(),
        });

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
        activePlayer.waitingAction = EPlayerWaitingAction.CHOOSE_PLAYER;

        this.sendSocketEvent(EGameServerEvent.WAIT_ACTION, {
          players: this.game.getGamePlayers(),
        });

        const selectedPlayerIndex = yield* this.waitForPlayerSocketEvent(EGameClientEvent.CHOOSE_PLAYER, {
          playerIndex: this.game.activePlayerIndex,
        });

        activePlayer.waitingAction = null;

        const selectedPlayer = players[selectedPlayerIndex];
        const coins = Math.min(selectedPlayer.coins, 5);

        selectedPlayer.coins -= coins;
        activePlayer.coins += coins;
      } else if (card.id === ECardId.BUSINESS_COMPLEX) {
        activePlayer.waitingAction = EPlayerWaitingAction.CHOOSE_CARDS_TO_SWAP;

        this.sendSocketEvent(EGameServerEvent.WAIT_ACTION, {
          players: this.game.getGamePlayers(),
        });

        const { from, toCardId } = yield* this.waitForPlayerSocketEvent(EGameClientEvent.CARDS_TO_SWAP, {
          playerIndex: this.game.activePlayerIndex,
        });

        activePlayer.waitingAction = null;

        const fromPlayer = players[from.playerIndex];

        activePlayer.cardsIds.splice(activePlayer.cardsIds.indexOf(toCardId), 1);
        fromPlayer.cardsIds.splice(fromPlayer.cardsIds.indexOf(from.cardId), 1);

        activePlayer.cardsIds.push(from.cardId);
        fromPlayer.cardsIds.push(toCardId);
      } else if (card.id === ECardId.PUBLISHER) {
        activePlayer.waitingAction = EPlayerWaitingAction.CHOOSE_PUBLISHER_TARGET;

        this.sendSocketEvent(EGameServerEvent.WAIT_ACTION, {
          players: this.game.getGamePlayers(),
        });

        const publisherTarget = yield* this.waitForPlayerSocketEvent(EGameClientEvent.PUBLISHER_TARGET, {
          playerIndex: this.game.activePlayerIndex,
        });

        activePlayer.waitingAction = null;

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
}
