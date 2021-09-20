import cloneDeep from 'lodash/cloneDeep';
import times from 'lodash/times';
import shuffle from 'lodash/shuffle';
import forEach from 'lodash/forEach';

import { GAMES_CONFIG } from 'common/constants/gamesConfig';

import { IGameEvent } from 'server/types';
import { EGame } from 'common/types/game';
import {
  ECarcassonneCardObject,
  ECarcassonneCityGoods,
  ECarcassonneGameEvent,
  ECarcassonneMeepleType,
  ECarcassonnePlayerColor,
  ICarcassonneAttachCardEvent,
  ICarcassonneCard,
  ICarcassonneGameCard,
  ICarcassonneGameInfoEvent,
  ICarcassonnePlayer,
  IPlacedMeeple,
  TCarcassonneBoard,
  TCarcassonneCardObject,
  TCarcassonneGameObject,
  TCarcassonneObjects,
  TCarcassonneScore,
} from 'common/types/carcassonne';
import { ICoords, IPlayer } from 'common/types';

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

import Game, { IGameCreateOptions } from 'server/gamesData/Game/Game';

interface IAttachCardOptions {
  card: ICarcassonneCard;
  coords: ICoords;
  rotation: number;
  meeple: IPlacedMeeple | null;
  player: ICarcassonnePlayer | null;
}

const {
  games: {
    [EGame.CARCASSONNE]: {
      allCards,
      cardsInHand,
    },
  },
} = GAMES_CONFIG;

// console.log(cards.filter((card) => !isValidCard(card)).map(({ id }) => id));

class CarcassonneGame extends Game<EGame.CARCASSONNE> {
  handlers = {
    [ECarcassonneGameEvent.GET_GAME_INFO]: this.onGetGameInfo,
    [ECarcassonneGameEvent.ATTACH_CARD]: this.onAttachCard,
  };

  deck: ICarcassonneCard[] = cloneDeep(allCards).map((card) => times(card.count, () => card)).flat();
  board: TCarcassonneBoard = {};
  objects: TCarcassonneObjects = {};
  lastId = 1;
  isBuilderMove = false;
  endTurnTimeout: number | null = null;
  endTurnTimeoutEndsAt: number | null = null;

  constructor(options: IGameCreateOptions<EGame.CARCASSONNE>) {
    super(options);

    this.createGameInfo();
  }

  attachCard(options: IAttachCardOptions): ICarcassonneGameCard {
    const {
      card,
      coords,
      rotation,
      meeple,
      player,
    } = options;
    const gameCard: ICarcassonneGameCard = (this.board[coords.y] ||= {})[coords.x] = {
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
      let gameObject: TCarcassonneGameObject | undefined;

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
            type: ECarcassonneCardObject.CITY,
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
            type: ECarcassonneCardObject.FIELD,
            cards: [],
            cities: [],
            meeples: {},
          };
        } else if (isCardRoad(object)) {
          gameObject = {
            id: newId,
            type: ECarcassonneCardObject.ROAD,
            cards: [],
            inn: false,
            isFinished: false,
            meeples: {},
          };
        } else {
          gameObject = {
            id: newId,
            type: ECarcassonneCardObject.MONASTERY,
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

  createPlayer(roomPlayer: IPlayer): ICarcassonnePlayer {
    return {
      ...roomPlayer,
      color: ECarcassonnePlayerColor.RED,
      isActive: false,
      score: [],
      cards: [],
      meeples: {
        [ECarcassonneMeepleType.COMMON]: 7,
        [ECarcassonneMeepleType.FAT]: 1,
        [ECarcassonneMeepleType.BUILDER]: 1,
        [ECarcassonneMeepleType.PIG]: 1,
      },
      goods: {
        [ECarcassonneCityGoods.WHEAT]: 0,
        [ECarcassonneCityGoods.FABRIC]: 0,
        [ECarcassonneCityGoods.WINE]: 0,
      },
      lastMoves: [],
    };
  }

  createGameInfo(): void {
    this.attachCard({
      card: allCards[0],
      coords: { x: 0, y: 0 },
      rotation: 0,
      meeple: null,
      player: null,
    });

    const colors = shuffle(Object.values(ECarcassonnePlayerColor));

    this.deck = shuffle(this.deck);

    this.players[Math.floor(Math.random() * this.players.length)].isActive = true;

    this.players.forEach((player, index) => {
      player.color = colors[index];

      times(cardsInHand, () => {
        const card = this.deck.pop();

        if (card) {
          player.cards.push(card);
        }
      });
    });

    this.setEndTurnTimer();
  }

  mergeCardObject(targetObject: TCarcassonneGameObject, mergedObject: TCarcassonneCardObject): void {
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

  mergeGameObject(targetObject: TCarcassonneGameObject, mergedObject: TCarcassonneGameObject): void {
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
        targetObject.goods[goodsType as ECarcassonneCityGoods] = (targetObject.goods[goodsType as ECarcassonneCityGoods] || 0) + (count || 0);
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
        playerMeeples[meepleType as ECarcassonneMeepleType] = (playerMeeples[meepleType as ECarcassonneMeepleType] || 0) + (count || 0);
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

  traverseNeighbors(coords: ICoords, callback: (card: ICarcassonneGameCard | undefined) => void): void {
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

  getPlayerObjectMeeples(playerObjectMeeples: Partial<Record<ECarcassonneMeepleType, number>> | undefined): number {
    return (
      (playerObjectMeeples?.[ECarcassonneMeepleType.COMMON] || 0)
      + 2 * (playerObjectMeeples?.[ECarcassonneMeepleType.FAT] || 0)
    );
  }

  addScore(player: ICarcassonnePlayer, score: TCarcassonneScore): void {
    if (score.score) {
      player.score.push(score);
    }
  }

  addObjectScore(object: TCarcassonneGameObject): void {
    const addScore = (login: string, score: number): void => {
      const player = this.getPlayerByLogin(login);

      if (player) {
        this.addScore(player, {
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

        addScore(login, finishedCities.length * (3 + (ECarcassonneMeepleType.PIG in playerMeeples ? 1 : 0)));
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

  returnMeeples(object: TCarcassonneGameObject): void {
    forEach(object.meeples, (playerMeeples, login) => {
      forEach(playerMeeples, (count, meepleType) => {
        const player = this.getPlayerByLogin(login);

        if (player) {
          player.meeples[meepleType as ECarcassonneMeepleType] += count || 0;
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

  getPlayerIndexWithCards(currentPlayerIndex: number): number | null {
    let nextPlayerIndexWithCards = currentPlayerIndex;

    while (this.players[currentPlayerIndex].cards.length === 0) {
      nextPlayerIndexWithCards = (nextPlayerIndexWithCards + 1) % this.players.length;

      // TODO: check for impossible cards

      if (nextPlayerIndexWithCards === currentPlayerIndex) {
        return null;
      }
    }

    return nextPlayerIndexWithCards;
  }

  setEndTurnTimer(): void {
    if (this.endTurnTimeout) {
      clearTimeout(this.endTurnTimeout);

      this.endTurnTimeout = null;
      this.endTurnTimeoutEndsAt = null;
    }

    const activePlayerIndex = this.players.findIndex(({ isActive }) => isActive);

    const placedCardsCount = Object.values(this.board).reduce((accCount, boardRow) => accCount + (boardRow ? Object.keys(boardRow).length : 0), 0);

    const turnDuration = 45000 + placedCardsCount * 700;

    this.endTurnTimeout = setTimeout(() => {
      const nextPlayerIndex = (activePlayerIndex + 1) % this.players.length;

      const nextPlayerIndexWithCards = this.getPlayerIndexWithCards(nextPlayerIndex);

      this.players[activePlayerIndex].isActive = false;

      if (nextPlayerIndexWithCards !== null) {
        this.players[nextPlayerIndexWithCards].isActive = true;
      }

      this.isBuilderMove = false;

      this.setEndTurnTimer();

      this.io.emit(ECarcassonneGameEvent.GAME_INFO, this.getGameInfoEvent());
    }, turnDuration);

    this.endTurnTimeoutEndsAt = Date.now() + turnDuration;
  }

  onGetGameInfo({ socket }: IGameEvent): void {
    socket.emit(ECarcassonneGameEvent.GAME_INFO, this.getGameInfoEvent());
  }

  onAttachCard({ data, socket }: IGameEvent<ICarcassonneAttachCardEvent>): void {
    const { cardIndex, coords, rotation, meeple } = data;
    const activePlayerIndex = this.players.findIndex(({ isActive }) => isActive);
    const activePlayer = this.players[activePlayerIndex];

    if (socket.user?.login !== activePlayer.login) {
      return;
    }

    const gameCard = this.attachCard({
      card: activePlayer.cards[cardIndex],
      coords,
      rotation,
      meeple,
      player: activePlayer,
    });

    const newCard = this.deck.pop();

    activePlayer.cards.splice(cardIndex, 1);

    if (newCard) {
      activePlayer.cards.splice(cardIndex, 0, newCard);
    }

    if (meeple) {
      activePlayer.meeples[meeple.type]--;
    }

    if (!this.isBuilderMove) {
      activePlayer.lastMoves = [];
    }

    activePlayer.lastMoves.push(coords);

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
            activePlayer.goods[goodsType as ECarcassonneCityGoods] += count || 0;
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
        (object.meeples[activePlayer.login]?.[ECarcassonneMeepleType.BUILDER] || 0) > 0
        && meeple?.type !== ECarcassonneMeepleType.BUILDER
      ) {
        attachedToBuilder = true;
      }
    }

    let nextActivePlayerIndex: number;

    if (attachedToBuilder && !this.isBuilderMove) {
      this.isBuilderMove = true;
      nextActivePlayerIndex = activePlayerIndex;
    } else {
      this.isBuilderMove = false;
      nextActivePlayerIndex = (activePlayerIndex + 1) % this.players.length;
    }

    const nextActivePlayerIndexWithCards = this.getPlayerIndexWithCards(nextActivePlayerIndex);

    if (nextActivePlayerIndexWithCards !== nextActivePlayerIndex) {
      this.isBuilderMove = false;
    }

    activePlayer.isActive = false;

    if (nextActivePlayerIndexWithCards !== null) {
      this.players[nextActivePlayerIndexWithCards].isActive = true;
    }

    this.io.emit(ECarcassonneGameEvent.GAME_INFO, this.getGameInfoEvent());

    if (this.players.every(({ cards }) => cards.length === 0)) {
      this.end();

      if (this.endTurnTimeout) {
        clearTimeout(this.endTurnTimeout);

        this.endTurnTimeout = null;
        this.endTurnTimeoutEndsAt = null;
      }

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

      const maxGoods: Record<ECarcassonneCityGoods, number> = {
        [ECarcassonneCityGoods.WHEAT]: 0,
        [ECarcassonneCityGoods.FABRIC]: 0,
        [ECarcassonneCityGoods.WINE]: 0,
      };

      forEach(this.players, ({ goods }) => {
        forEach(goods, (count, goodsType) => {
          maxGoods[goodsType as ECarcassonneCityGoods] = Math.max(
            maxGoods[goodsType as ECarcassonneCityGoods],
            count,
          );
        });
      });

      forEach(this.players, (player) => {
        forEach(player.goods, (count, goodsType) => {
          if (count && maxGoods[goodsType as ECarcassonneCityGoods] === count) {
            this.addScore(player, {
              goods: goodsType as ECarcassonneCityGoods,
              score: 15,
            });
          }
        });
      });

      this.io.emit(ECarcassonneGameEvent.GAME_INFO, this.getGameInfoEvent());

      return;
    }

    if (nextActivePlayerIndexWithCards !== activePlayerIndex) {
      this.setEndTurnTimer();

      this.io.emit(ECarcassonneGameEvent.GAME_INFO, this.getGameInfoEvent());
    }
  }

  getGameInfoEvent(): ICarcassonneGameInfoEvent {
    return {
      players: this.players,
      board: this.board,
      objects: this.objects,
      cardsLeft: this.deck.length,
      turnEndsAt: this.endTurnTimeoutEndsAt,
    };
  }

  deleteGame(): void {
    if (this.endTurnTimeout) {
      clearTimeout(this.endTurnTimeout);
    }

    super.deleteGame();
  }
}

export default CarcassonneGame;
