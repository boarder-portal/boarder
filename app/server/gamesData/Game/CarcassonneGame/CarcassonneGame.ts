import cloneDeep from 'lodash/cloneDeep';
import forEach from 'lodash/forEach';
import shuffle from 'lodash/shuffle';
import times from 'lodash/times';

import { SECOND } from 'common/constants/date';
import { ALL_CARDS, BASE_TIME, CARDS_IN_HAND, TURN_INCREMENT } from 'common/constants/games/carcassonne';

import { Coords } from 'common/types';
import { GameType } from 'common/types/game';
import {
  Board,
  Card,
  CardObject,
  CardObjectType,
  CityGoodsType,
  Game,
  GameCard,
  GameEventType,
  GameObject,
  GameResult,
  MeepleType,
  Objects,
  PlacedMeeple,
  Player,
  PlayerColor,
  PlayerData,
  Score,
} from 'common/types/games/carcassonne';

import {
  getAttachedObjectId,
  getObjectPlayerMeeples,
  isCardCity,
  isCardField,
  isCardRoad,
  isGameCity,
  isGameField,
  isGameMonastery,
  isGameRoad,
  isSideObject,
} from 'common/utilities/games/carcassonne';
import Entity, { EntityGenerator } from 'server/gamesData/Game/utilities/Entity/Entity';
import GameInfo from 'server/gamesData/Game/utilities/Entity/components/GameInfo';
import Server from 'server/gamesData/Game/utilities/Entity/components/Server';
import TestCase from 'server/gamesData/Game/utilities/Entity/components/TestCase';
import Time from 'server/gamesData/Game/utilities/Entity/components/Time';
import TurnController from 'server/gamesData/Game/utilities/Entity/components/TurnController';

import Turn from 'server/gamesData/Game/CarcassonneGame/entities/Turn';

interface AttachCardOptions {
  card: Card;
  coords: Coords;
  rotation: number;
  meeple: PlacedMeeple | null;
  playerIndex: number | null;
}

interface AttachPlayerCardOptions {
  cardIndex: number;
  coords: Coords;
  rotation: number;
  meeple: PlacedMeeple | null;
  isFirstTurnCard: boolean;
}

// console.log(ALL_CARDS.filter((card) => !isValidCard(card)).map(({ id }) => id));

export default class CarcassonneGame extends Entity<GameResult> {
  testCase = this.getClosestComponent(TestCase<GameType.CARCASSONNE>);

  turnController = this.addComponent(TurnController, {
    isPlayerInPlay: this.canPlayAnyCards,
  });
  time = this.addComponent(Time, {
    isPauseAvailable: this.isTimerGame,
  });
  gameInfo = this.obtainComponent(GameInfo<GameType.CARCASSONNE, this>);
  server = this.obtainComponent(Server<GameType.CARCASSONNE, this>);

  playersData = this.gameInfo.createPlayersData<PlayerData>({
    init: () => ({
      color: PlayerColor.RED,
      score: [],
      cards: [],
      meeples: {
        [MeepleType.COMMON]: 7,
        [MeepleType.FAT]: 1,
        [MeepleType.BUILDER]: 1,
        [MeepleType.PIG]: 1,
      },
      goods: {
        [CityGoodsType.WHEAT]: 0,
        [CityGoodsType.FABRIC]: 0,
        [CityGoodsType.WINE]: 0,
      },
      lastMoves: [],
    }),
  });
  deck: Card[] = shuffle(
    cloneDeep(ALL_CARDS)
      .map((card) => times(card.count, () => card))
      .flat(),
  );
  board: Board = {};
  objects: Objects = {};
  lastId = 1;

  turn: Turn | null = null;

  *lifecycle(): EntityGenerator<GameResult> {
    this.testCase.dispatchGameEvent(GameEventType.GAME_STARTED, this);

    if (this.isTimerGame()) {
      this.spawnTask(this.server.pingIndefinitely(15 * SECOND));
    }

    this.attachCard({
      card: ALL_CARDS[0],
      coords: { x: 0, y: 0 },
      rotation: 0,
      meeple: null,
      playerIndex: null,
    });

    const colors = shuffle(Object.values(PlayerColor));

    this.playersData.forEach((playerData, index) => {
      playerData.color = colors[index];

      playerData.cards.push(...this.deck.splice(-CARDS_IN_HAND));
    });

    while (this.turnController.hasActivePlayer) {
      this.turn = this.spawnEntity(Turn, {
        duration: BASE_TIME + this.getPlacedCardsCount() * TURN_INCREMENT,
      });

      this.server.sendGameInfo();

      const placedAnyCards = yield* this.waitForEntity(this.turn);

      if (!placedAnyCards) {
        this.playersData.getActive().lastMoves = [];
      }

      this.turnController.passTurn();
    }

    this.turn = null;

    forEach(this.objects, (object) => {
      if (
        object &&
        (isGameField(object) ||
          (isGameMonastery(object) && object.cards.length < 9) ||
          ((isGameCity(object) || isGameRoad(object)) && !object.isFinished))
      ) {
        this.addObjectScore(object);
      }
    });

    const maxGoods: Record<CityGoodsType, number> = {
      [CityGoodsType.WHEAT]: 0,
      [CityGoodsType.FABRIC]: 0,
      [CityGoodsType.WINE]: 0,
    };

    this.playersData.forEach(({ goods }) => {
      forEach(goods, (count, goodsType) => {
        maxGoods[goodsType as CityGoodsType] = Math.max(maxGoods[goodsType as CityGoodsType], count);
      });
    });

    this.playersData.forEach(({ goods }, playerIndex) => {
      forEach(goods, (count, goodsType) => {
        if (count && maxGoods[goodsType as CityGoodsType] === count) {
          this.addPlayerScore(playerIndex, {
            goods: goodsType as CityGoodsType,
            score: 15,
          });
        }
      });
    });

    this.server.sendGameInfo();
  }

  addObjectScore(object: GameObject): void {
    const addScore = (playerIndex: number, score: number): void => {
      this.addPlayerScore(playerIndex, {
        objectId: object.id,
        score,
      });
    };

    let owners: number[] = [];
    let maxMeeples = 1;

    this.gameInfo.forEachPlayer((playerIndex) => {
      const meeplesCount = this.getPlayerObjectMeeples(object, playerIndex);

      if (meeplesCount > maxMeeples) {
        owners = [playerIndex];
        maxMeeples = meeplesCount;
      } else if (meeplesCount === maxMeeples) {
        owners.push(playerIndex);
      }
    });

    if (isGameMonastery(object) && owners.length > 0) {
      addScore(owners[0], object.cards.length);
    } else if (isGameField(object)) {
      owners.forEach((playerIndex) => {
        const hasPig = getObjectPlayerMeeples(object, playerIndex).some(({ type }) => type === MeepleType.PIG);
        const finishedCities = object.cities.filter((cityId) => {
          const city = this.objects[cityId];

          return city && isGameCity(city) && city.isFinished;
        });

        addScore(playerIndex, finishedCities.length * (3 + (hasPig ? 1 : 0)));
      });
    } else if (isGameCity(object)) {
      const score =
        (object.isFinished ? (object.cathedral ? 3 : 2) : object.cathedral ? 0 : 1) *
        (object.cards.length + object.shields);

      owners.forEach((playerIndex) => {
        addScore(playerIndex, score);
      });
    } else if (isGameRoad(object)) {
      const score = (object.inn ? (object.isFinished ? 2 : 0) : 1) * object.cards.length;

      owners.forEach((playerIndex) => {
        addScore(playerIndex, score);
      });
    }
  }

  addPlayerScore(playerIndex: number, score: Score): void {
    if (score.score) {
      this.playersData.get(playerIndex).score.push(score);
    }
  }

  attachCard(options: AttachCardOptions): GameCard {
    const { card, coords, rotation, meeple, playerIndex } = options;
    const gameCard: GameCard = ((this.board[coords.y] ||= {})[coords.x] = {
      ...coords,
      id: card.id,
      rotation,
      monasteryId: null,
      objectsBySideParts: times(12, () => 0),
      meeple:
        meeple &&
        (playerIndex === null
          ? null
          : {
              ...meeple,
              playerIndex,
              gameObjectId: 0,
            }),
    });
    const idsMap = new Map<number, number>();

    card.objects.forEach((object, objectId) => {
      let gameObject: GameObject | undefined;

      if (isSideObject(object)) {
        const attachedObjectIds = new Set<number>();

        object.sideParts.forEach((sidePart) => {
          const rotatedSidePart = (sidePart + 3 * rotation) % 12;
          const objectId = getAttachedObjectId(coords, rotatedSidePart, this.board);

          if (objectId) {
            attachedObjectIds.add(objectId);
          }
        });

        if (attachedObjectIds.size > 0) {
          const objectId = [...attachedObjectIds][0];

          gameObject = this.objects[objectId];

          if (gameObject) {
            for (const objectId of attachedObjectIds) {
              const object = this.objects[objectId];

              if (object && object !== gameObject) {
                this.mergeGameObject(gameObject, object);

                delete this.objects[objectId];
              }
            }
          }
        }
      }

      if (!gameObject) {
        const newId = this.lastId++;

        if (isCardCity(object)) {
          gameObject = {
            id: newId,
            type: CardObjectType.CITY,
            cards: [],
            shields: 0,
            cathedral: false,
            goods: {},
            isFinished: false,
            meeples: [],
          };
        } else if (isCardField(object)) {
          gameObject = {
            id: newId,
            type: CardObjectType.FIELD,
            cards: [],
            cities: [],
            meeples: [],
          };
        } else if (isCardRoad(object)) {
          gameObject = {
            id: newId,
            type: CardObjectType.ROAD,
            cards: [],
            inn: false,
            isFinished: false,
            meeples: [],
          };
        } else {
          gameObject = {
            id: newId,
            type: CardObjectType.MONASTERY,
            cards: [],
            meeples: [],
          };
          gameCard.monasteryId = newId;
        }

        this.objects[newId] = gameObject;
      }

      if (gameObject) {
        idsMap.set(objectId, gameObject.id);

        this.mergeCardObject(gameObject, object);

        if (!gameObject.cards.includes(coords)) {
          gameObject.cards.push(coords);
        }

        if (objectId === meeple?.cardObjectId) {
          if (gameCard.meeple) {
            gameCard.meeple.gameObjectId = gameObject.id;
          }

          if (playerIndex !== null) {
            gameObject.meeples.push({
              playerIndex,
              type: meeple.type,
            });
          }
        }

        if (isGameMonastery(gameObject)) {
          this.traverseNeighbors(coords, (card) => {
            if (card) {
              gameObject?.cards.push({ x: card.x, y: card.y });
            }
          });
        } else if (isSideObject(object)) {
          for (const sidePart of object.sideParts) {
            const rotatedSidePart = (sidePart + 3 * rotation) % 12;

            gameCard.objectsBySideParts[rotatedSidePart] = gameObject.id;
          }
        }
      }
    });

    card.objects.forEach((object, objectId) => {
      const gameObjectId = idsMap.get(objectId);

      if (!gameObjectId) {
        return;
      }

      const gameObject = this.objects[gameObjectId];

      if (!gameObject) {
        return;
      }

      if (isCardField(object) && isGameField(gameObject)) {
        object.cities?.forEach((cardCityId) => {
          const gameCityId = idsMap.get(cardCityId);

          if (gameCityId && !gameObject.cities.includes(gameCityId)) {
            gameObject.cities.push(gameCityId);
          }
        });
      } else if (isGameCity(gameObject) || isGameRoad(gameObject)) {
        if (
          gameObject.cards.every((coords) => {
            const card = this.board[coords.y]?.[coords.x];

            return card?.objectsBySideParts.every((objectId, sidePart) => {
              if (objectId !== gameObjectId) {
                return true;
              }

              const attachedObjectId = getAttachedObjectId(coords, sidePart, this.board);

              return attachedObjectId && this.objects[attachedObjectId]?.id === gameObjectId;
            });
          })
        ) {
          gameObject.isFinished = true;
        }
      }
    });

    return gameCard;
  }

  attachPlayerCard(options: AttachPlayerCardOptions): boolean {
    const { activePlayerIndex } = this.turnController;
    const { cardIndex, coords, rotation, meeple, isFirstTurnCard } = options;
    const playerData = this.playersData.getActive();

    const gameCard = this.attachCard({
      card: playerData.cards[cardIndex],
      coords,
      rotation,
      meeple,
      playerIndex: activePlayerIndex,
    });

    playerData.cards.splice(cardIndex, 1, ...this.deck.splice(-1));

    if (meeple) {
      playerData.meeples[meeple.type]--;
    }

    if (isFirstTurnCard) {
      playerData.lastMoves = [];
    }

    playerData.lastMoves.push(coords);

    this.traverseNeighbors(coords, (card) => {
      if (!card?.monasteryId) {
        return;
      }

      const monastery = this.objects[card.monasteryId];

      if (!monastery) {
        return;
      }

      monastery.cards.push(coords);

      if (monastery.cards.length === 9) {
        this.addObjectScore(monastery);
        this.returnMeeples(monastery);
      }
    });

    if (gameCard.monasteryId) {
      const monastery = this.objects[gameCard.monasteryId];

      if (monastery && monastery.cards.length === 9) {
        this.addObjectScore(monastery);
        this.returnMeeples(monastery);
      }
    }

    for (const objectId of new Set(gameCard.objectsBySideParts)) {
      const object = this.objects[objectId];

      if (!object) {
        continue;
      }

      if ((isGameCity(object) || isGameRoad(object)) && object.isFinished) {
        this.addObjectScore(object);
        this.returnMeeples(object);

        if (isGameCity(object)) {
          forEach(object.goods, (count, goodsType) => {
            playerData.goods[goodsType as CityGoodsType] += count || 0;
          });
        }
      }
    }

    let attachedToBuilder = false;

    for (const objectId of gameCard.objectsBySideParts) {
      const object = this.objects[objectId];

      if (!object) {
        continue;
      }

      if (
        getObjectPlayerMeeples(object, activePlayerIndex).some(({ type }) => type === MeepleType.BUILDER) &&
        meeple?.type !== MeepleType.BUILDER
      ) {
        attachedToBuilder = true;
      }
    }

    this.server.sendGameInfo();

    return attachedToBuilder;
  }

  canPlayAnyCards(playerIndex: number): boolean {
    // TODO: check for impossible cards

    return this.playersData.get(playerIndex).cards.length !== 0;
  }

  getGamePlayers(): Player[] {
    return this.gameInfo.getPlayersWithData((playerIndex) => this.playersData.get(playerIndex));
  }

  getPlacedCardsCount(): number {
    return Object.values(this.board).reduce(
      (accCount, boardRow) => accCount + (boardRow ? Object.keys(boardRow).length : 0),
      0,
    );
  }

  getPlayerObjectMeeples(object: GameObject, playerIndex: number): number {
    return getObjectPlayerMeeples(object, playerIndex).reduce(
      (count, { type }) => count + (type === MeepleType.COMMON ? 1 : type === MeepleType.FAT ? 2 : 0),
      0,
    );
  }

  isTimerGame(): boolean {
    return this.gameInfo.options.withTimer;
  }

  mergeCardObject(targetObject: GameObject, mergedObject: CardObject): void {
    if (isGameRoad(targetObject) && isCardRoad(mergedObject)) {
      targetObject.inn ||= mergedObject.inn ?? false;
    } else if (isGameCity(targetObject) && isCardCity(mergedObject)) {
      targetObject.shields += mergedObject.shields ?? 0;
      targetObject.cathedral ||= mergedObject.cathedral ?? false;

      if (mergedObject.goods) {
        targetObject.goods[mergedObject.goods] = (targetObject.goods[mergedObject.goods] || 0) + 1;
      }
    }
  }

  mergeGameObject(targetObject: GameObject, mergedObject: GameObject): void {
    const mergeCards = () => {
      targetObject.cards = [...new Set([...targetObject.cards, ...mergedObject.cards])];
    };

    if (isGameField(targetObject) && isGameField(mergedObject)) {
      targetObject.cities = [...new Set([...targetObject.cities, ...mergedObject.cities])];

      mergeCards();
    } else if (isGameRoad(targetObject) && isGameRoad(mergedObject)) {
      targetObject.inn ||= mergedObject.inn;

      mergeCards();
    } else if (isGameCity(targetObject) && isGameCity(mergedObject)) {
      targetObject.shields += mergedObject.shields;
      targetObject.cathedral ||= mergedObject.cathedral;

      forEach(mergedObject.goods, (count, goodsType) => {
        targetObject.goods[goodsType as CityGoodsType] =
          (targetObject.goods[goodsType as CityGoodsType] || 0) + (count || 0);
      });

      mergeCards();

      forEach(this.objects, (object) => {
        if (!object || !isGameField(object)) {
          return;
        }

        if (object.cities.includes(mergedObject.id)) {
          object.cities = object.cities.filter((cityId) => cityId !== mergedObject.id);

          if (!object.cities.includes(targetObject.id)) {
            object.cities.push(targetObject.id);
          }
        }
      });
    }

    mergedObject.cards.forEach((coords) => {
      const card = this.board[coords.y]?.[coords.x];

      if (card?.meeple?.gameObjectId === mergedObject.id) {
        card.meeple.gameObjectId = targetObject.id;
      }
    });

    targetObject.meeples.push(...mergedObject.meeples);

    forEach(this.board, (row) => {
      forEach(row, (card) => {
        if (!card) {
          return;
        }

        card.objectsBySideParts.forEach((objectId, sidePart) => {
          if (objectId === mergedObject.id) {
            card.objectsBySideParts[sidePart] = targetObject.id;
          }
        });
      });
    });
  }

  returnMeeples(object: GameObject): void {
    object.meeples.forEach(({ playerIndex, type }) => {
      this.playersData.get(playerIndex).meeples[type]++;
    });

    object.cards.forEach((coords) => {
      const card = this.board[coords.y]?.[coords.x];

      if (card?.meeple && card.meeple.gameObjectId === object.id) {
        card.meeple = null;
      }
    });
  }

  traverseNeighbors(coords: Coords, callback: (card: GameCard | undefined) => void): void {
    const getCard = (coords: Coords) => this.board[coords.y]?.[coords.x];

    callback(getCard({ x: coords.x, y: coords.y - 1 }));
    callback(getCard({ x: coords.x + 1, y: coords.y - 1 }));
    callback(getCard({ x: coords.x + 1, y: coords.y }));
    callback(getCard({ x: coords.x + 1, y: coords.y + 1 }));
    callback(getCard({ x: coords.x, y: coords.y + 1 }));
    callback(getCard({ x: coords.x - 1, y: coords.y + 1 }));
    callback(getCard({ x: coords.x - 1, y: coords.y }));
    callback(getCard({ x: coords.x - 1, y: coords.y - 1 }));
  }

  toJSON(): Game {
    return {
      players: this.getGamePlayers(),
      activePlayerIndex: this.turnController.activePlayerIndex,
      board: this.board,
      objects: this.objects,
      cardsLeft: this.deck.length,
      turn: this.turn?.toJSON() ?? null,
    };
  }
}
