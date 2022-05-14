import cloneDeep from 'lodash/cloneDeep';
import times from 'lodash/times';
import forEach from 'lodash/forEach';
import shuffle from 'lodash/shuffle';

import { ALL_CARDS, BASE_TIME, CARDS_IN_HAND, TURN_INCREMENT } from 'common/constants/games/carcassonne';

import { EGame } from 'common/types/game';
import {
  ECardObject,
  ECityGoods,
  EGameEvent,
  EMeepleType,
  EPlayerColor,
  ICard,
  IGame,
  IGameCard,
  IPlacedMeeple,
  IPlayer,
  TBoard,
  TCardObject,
  TGameObject,
  TObjects,
  TScore,
} from 'common/types/carcassonne';
import { ICoords } from 'common/types';

import GameEntity from 'server/gamesData/Game/utilities/GameEntity';
import {
  getAttachedObjectId,
  isCardCity,
  isCardField,
  isCardRoad,
  isGameCity,
  isGameField,
  isGameMonastery,
  isGameRoad,
  isSideObject,
} from 'common/utilities/carcassonne';

import Turn from 'server/gamesData/Game/CarcassonneGame/entities/Turn';

interface IAttachCardOptions {
  card: ICard;
  coords: ICoords;
  rotation: number;
  meeple: IPlacedMeeple | null;
  player: IPlayer | null;
}

interface IAttachPlayerCardOptions {
  cardIndex: number;
  coords: ICoords;
  rotation: number;
  meeple: IPlacedMeeple | null;
  player: IPlayer;
  isFirstTurnCard: boolean;
}

export default class CarcassonneGame extends GameEntity<EGame.CARCASSONNE> {
  players: IPlayer[];

  activePlayerIndex = 0;
  deck: ICard[] = shuffle(cloneDeep(ALL_CARDS).map((card) => times(card.count, () => card)).flat());
  board: TBoard = {};
  objects: TObjects = {};
  lastId = 1;

  turn: Turn | null = null;

  constructor(players: IPlayer[]) {
    super();

    this.players = players;
  }

  *lifecycle() {
    this.attachCard({
      card: ALL_CARDS[0],
      coords: { x: 0, y: 0 },
      rotation: 0,
      meeple: null,
      player: null,
    });

    const colors = shuffle(Object.values(EPlayerColor));

    this.players.forEach((player, index) => {
      player.color = colors[index];

      player.cards.push(...this.deck.splice(-CARDS_IN_HAND));
    });

    while (this.activePlayerIndex !== -1) {
      const activePlayer = this.players[this.activePlayerIndex];

      this.turn = this.spawnEntity(
        new Turn(this, {
          activePlayer,
          duration: BASE_TIME + this.getPlacedCardsCount() * TURN_INCREMENT,
        }),
      );

      this.sendGameInfo();

      const placedAnyCards = yield* this.turn;

      if (!placedAnyCards) {
        activePlayer.lastMoves = [];
      }

      this.activePlayerIndex = this.getPlayerIndexWithCards((this.activePlayerIndex + 1) % this.players.length);
    }

    this.turn = null;

    forEach(this.objects, (object) => {
      if (
        object
        && (
          isGameField(object)
          || (isGameMonastery(object) && object.cards.length < 9)
          || ((isGameCity(object) || isGameRoad(object)) && !object.isFinished)
        )
      ) {
        this.addObjectScore(object);
      }
    });

    const maxGoods: Record<ECityGoods, number> = {
      [ECityGoods.WHEAT]: 0,
      [ECityGoods.FABRIC]: 0,
      [ECityGoods.WINE]: 0,
    };

    forEach(this.players, ({ goods }) => {
      forEach(goods, (count, goodsType) => {
        maxGoods[goodsType as ECityGoods] = Math.max(
          maxGoods[goodsType as ECityGoods],
          count,
        );
      });
    });

    forEach(this.players, (player) => {
      forEach(player.goods, (count, goodsType) => {
        if (count && maxGoods[goodsType as ECityGoods] === count) {
          this.addPlayerScore(player, {
            goods: goodsType as ECityGoods,
            score: 15,
          });
        }
      });
    });

    this.sendGameInfo();
  }

  addObjectScore(object: TGameObject): void {
    const addScore = (login: string, score: number): void => {
      const player = this.getPlayerByLogin(login);

      if (player) {
        this.addPlayerScore(player, {
          objectId: object.id,
          score,
        });
      }
    };

    let owners: string[] = [];
    let maxMeeples = -Infinity;

    forEach(object.meeples, (meeples, player) => {
      const meeplesCount = this.getPlayerObjectMeeples(meeples);

      if (meeplesCount > maxMeeples) {
        owners = [player];
        maxMeeples = meeplesCount;
      } else if (meeplesCount === maxMeeples) {
        owners.push(player);
      }
    });

    if (isGameMonastery(object) && owners.length > 0) {
      addScore(owners[0], object.cards.length);
    } else if (isGameField(object)) {
      owners.forEach((login) => {
        const playerMeeples = object.meeples[login] || {};
        const finishedCities = object.cities.filter((cityId) => {
          const city = this.objects[cityId];

          return city && isGameCity(city) && city.isFinished;
        });

        addScore(login, finishedCities.length * (3 + (EMeepleType.PIG in playerMeeples ? 1 : 0)));
      });
    } else if (isGameCity(object)) {
      const score = (
        object.isFinished
          ? object.cathedral
            ? 3
            : 2
          : object.cathedral
            ? 0
            : 1
      ) * (object.cards.length + object.shields);

      owners.forEach((login) => {
        addScore(login, score);
      });
    } else if (isGameRoad(object)) {
      const score = (
        object.inn
          ? object.isFinished
            ? 2
            : 0
          : 1
      ) * object.cards.length;

      owners.forEach((login) => {
        addScore(login, score);
      });
    }
  }

  addPlayerScore(player: IPlayer, score: TScore): void {
    if (score.score) {
      player.score.push(score);
    }
  }

  attachCard(options: IAttachCardOptions): IGameCard {
    const {
      card,
      coords,
      rotation,
      meeple,
      player,
    } = options;
    const gameCard: IGameCard = (this.board[coords.y] ||= {})[coords.x] = {
      ...coords,
      id: card.id,
      rotation,
      monasteryId: null,
      objectsBySideParts: times(12, () => 0),
      meeple: meeple && player && {
        ...meeple,
        color: player.color,
        gameObjectId: 0,
      },
    };
    const idsMap = new Map<number, number>();

    card.objects.forEach((object, objectId) => {
      let gameObject: TGameObject | undefined;

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
            type: ECardObject.CITY,
            cards: [],
            shields: 0,
            cathedral: false,
            goods: {},
            isFinished: false,
            meeples: {},
          };
        } else if (isCardField(object)) {
          gameObject = {
            id: newId,
            type: ECardObject.FIELD,
            cards: [],
            cities: [],
            meeples: {},
          };
        } else if (isCardRoad(object)) {
          gameObject = {
            id: newId,
            type: ECardObject.ROAD,
            cards: [],
            inn: false,
            isFinished: false,
            meeples: {},
          };
        } else {
          gameObject = {
            id: newId,
            type: ECardObject.MONASTERY,
            cards: [],
            meeples: {},
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

          if (player) {
            const playerMeeples = gameObject.meeples[player.login] ||= {};

            playerMeeples[meeple.type] = (playerMeeples[meeple.type] || 0) + 1;
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

  attachPlayerCard(options: IAttachPlayerCardOptions): boolean {
    const {
      cardIndex,
      coords,
      rotation,
      meeple,
      player,
      isFirstTurnCard,
    } = options;

    const gameCard = this.attachCard({
      card: player.cards[cardIndex],
      coords,
      rotation,
      meeple,
      player,
    });

    player.cards.splice(cardIndex, 1, ...this.deck.splice(-1));

    if (meeple) {
      player.meeples[meeple.type]--;
    }

    if (isFirstTurnCard) {
      player.lastMoves = [];
    }

    player.lastMoves.push(coords);

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
            player.goods[goodsType as ECityGoods] += count || 0;
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
        (object.meeples[player.login]?.[EMeepleType.BUILDER] || 0) > 0
        && meeple?.type !== EMeepleType.BUILDER
      ) {
        attachedToBuilder = true;
      }
    }

    this.sendGameInfo();

    return attachedToBuilder;
  }

  getPlacedCardsCount(): number {
    return Object.values(this.board).reduce((accCount, boardRow) => accCount + (boardRow ? Object.keys(boardRow).length : 0), 0);
  }

  getPlayerIndexWithCards(currentPlayerIndex: number): number {
    let nextPlayerIndexWithCards = currentPlayerIndex;

    while (!this.hasCards(nextPlayerIndexWithCards)) {
      nextPlayerIndexWithCards = (nextPlayerIndexWithCards + 1) % this.players.length;

      // TODO: check for impossible cards

      if (nextPlayerIndexWithCards === currentPlayerIndex) {
        return -1;
      }
    }

    return nextPlayerIndexWithCards;
  }

  getPlayerObjectMeeples(playerObjectMeeples: Partial<Record<EMeepleType, number>> | undefined): number {
    return (
      (playerObjectMeeples?.[EMeepleType.COMMON] || 0)
      + 2 * (playerObjectMeeples?.[EMeepleType.FAT] || 0)
    );
  }

  hasCards(playerIndex: number): boolean {
    return this.players[playerIndex].cards.length !== 0;
  }

  mergeCardObject(targetObject: TGameObject, mergedObject: TCardObject): void {
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

  mergeGameObject(targetObject: TGameObject, mergedObject: TGameObject): void {
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
        targetObject.goods[goodsType as ECityGoods] = (targetObject.goods[goodsType as ECityGoods] || 0) + (count || 0);
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

    forEach(mergedObject.meeples, (meeples, login) => {
      const playerMeeples = targetObject.meeples[login] ||= {};

      forEach(meeples, (count, meepleType) => {
        playerMeeples[meepleType as EMeepleType] = (playerMeeples[meepleType as EMeepleType] || 0) + (count || 0);
      });
    });

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

  sendGameInfo(): void {
    this.sendSocketEvent(EGameEvent.GAME_INFO, this.toJSON());
  }

  returnMeeples(object: TGameObject): void {
    forEach(object.meeples, (playerMeeples, login) => {
      forEach(playerMeeples, (count, meepleType) => {
        const player = this.getPlayerByLogin(login);

        if (player) {
          player.meeples[meepleType as EMeepleType] += count || 0;
        }
      });
    });

    const returnFromCards = isGameMonastery(object)
      ? object.cards.slice(0)
      : object.cards;

    returnFromCards.forEach((coords) => {
      const card = this.board[coords.y]?.[coords.x];

      if (card?.meeple && card.meeple.gameObjectId === object.id) {
        card.meeple = null;
      }
    });
  }

  traverseNeighbors(coords: ICoords, callback: (card: IGameCard | undefined) => void): void {
    const getCard = (coords: ICoords) => this.board[coords.y]?.[coords.x];

    callback(getCard({ x: coords.x, y: coords.y - 1 }));
    callback(getCard({ x: coords.x + 1, y: coords.y - 1 }));
    callback(getCard({ x: coords.x + 1, y: coords.y }));
    callback(getCard({ x: coords.x + 1, y: coords.y + 1 }));
    callback(getCard({ x: coords.x, y: coords.y + 1 }));
    callback(getCard({ x: coords.x - 1, y: coords.y + 1 }));
    callback(getCard({ x: coords.x - 1, y: coords.y }));
    callback(getCard({ x: coords.x - 1, y: coords.y - 1 }));
  }

  toJSON(): IGame {
    return {
      players: this.players,
      activePlayerIndex: this.activePlayerIndex,
      board: this.board,
      objects: this.objects,
      cardsLeft: this.deck.length,
      turn: this.turn?.toJSON() ?? null,
    };
  }
}
