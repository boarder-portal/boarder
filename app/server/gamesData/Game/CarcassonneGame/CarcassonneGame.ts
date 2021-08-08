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
  ICarcassonneAttachCardEvent,
  ICarcassonneCard,
  ICarcassonneGameCard,
  ICarcassonneGameInfoEvent,
  ICarcassonnePlayer,
  TCarcassonneBoard,
  TCarcassonneCardObject,
  TCarcassonneGameObject,
  TCarcassonneObjects,
} from 'common/types/carcassonne';
import { ICoords, IPlayer } from 'common/types';

import {
  getAttachedObjectId,
  isCardCity,
  isCardField,
  isCardRoad,
  isGameCity,
  isGameField,
  isGameRoad,
  isSideObject,
} from 'common/utilities/carcassonne';

import Game, { IGameCreateOptions } from 'server/gamesData/Game/Game';

const {
  games: {
    [EGame.CARCASSONNE]: {
      cards,
      cardsInHand,
    },
  },
} = GAMES_CONFIG;

class CarcassonneGame extends Game<EGame.CARCASSONNE> {
  handlers = {
    [ECarcassonneGameEvent.GET_GAME_INFO]: this.onGetGameInfo,
    [ECarcassonneGameEvent.ATTACH_CARD]: this.onAttachCard,
  };

  deck: ICarcassonneCard[] = cloneDeep(cards).map((card) => times(card.count, () => card)).flat();
  board: TCarcassonneBoard = {};
  objects: TCarcassonneObjects = {};
  lastId = 1;

  constructor(options: IGameCreateOptions<EGame.CARCASSONNE>) {
    super(options);

    this.createGameInfo();
  }

  attachCard(card: ICarcassonneCard, coords: ICoords, rotation: number) {
    const gameCard: ICarcassonneGameCard = (this.board[coords.y] ||= {})[coords.x] = {
      ...coords,
      id: card.id,
      rotation,
      objectsBySideParts: times(12, () => 0),
    };
    const idsMap = new Map<number, number>();

    card.objects.forEach((object, objectId) => {
      let gameObject: TCarcassonneGameObject | undefined;

      if (isSideObject(object)) {
        const attachedObjectIds = new Set<number>();

        object.sideParts.forEach((sidePart) => {
          const rotatedSidePart = (sidePart + 3 * rotation) % 12;
          const objectId = getAttachedObjectId({ card: coords, sidePart: rotatedSidePart }, this.board);

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
            // TODO: calc ends
            ends: [],
          };
        } else if (isCardField(object)) {
          gameObject = {
            id: newId,
            type: ECarcassonneCardObject.FIELD,
            cards: [],
            // TODO: calc cities
            cities: [],
          };
        } else if (isCardRoad(object)) {
          gameObject = {
            id: newId,
            type: ECarcassonneCardObject.ROAD,
            cards: [],
            inn: false,
            // TODO: calc ends
            ends: [],
          };
        } else {
          gameObject = {
            id: newId,
            type: ECarcassonneCardObject.MONASTERY,
            cards: [],
          };
        }

        this.objects[newId] = gameObject;
      }

      if (gameObject) {
        idsMap.set(objectId, gameObject.id);

        this.mergeCardObject(gameObject, object);

        if (!gameObject.cards.includes(coords)) {
          gameObject.cards.push(coords);
        }

        if (isSideObject(object)) {
          for (const sidePart of object.sideParts) {
            const rotatedSidePart = (sidePart + 3 * rotation) % 12;

            gameCard.objectsBySideParts[rotatedSidePart] = gameObject.id;
          }
        }
      }
    });

    card.objects.forEach((field, objectId) => {
      if (!isCardField(field)) {
        return;
      }

      const gameId = idsMap.get(objectId);

      if (!gameId) {
        return;
      }

      const gameField = this.objects[gameId];

      if (!gameField || !isGameField(gameField)) {
        return;
      }

      field.cities?.forEach((cardCityId) => {
        const gameCityId = idsMap.get(cardCityId);

        if (gameCityId && !gameField.cities.includes(gameCityId)) {
          gameField.cities.push(gameCityId);
        }
      });
    });
  }

  createPlayer(roomPlayer: IPlayer): ICarcassonnePlayer {
    return {
      ...roomPlayer,
      isActive: false,
      score: [],
      cards: [],
    };
  }

  createGameInfo() {
    const firstCard = this.deck.shift();

    if (!firstCard) {
      throw new Error('No cards');
    }

    this.attachCard(firstCard, { x: 0, y: 0 }, 0);

    this.deck = shuffle(this.deck);

    this.players[Math.floor(Math.random() * this.players.length)].isActive = true;

    this.players.forEach((player) => {
      times(cardsInHand, () => {
        const card = this.deck.pop();

        if (card) {
          player.cards.push(card);
        }
      });
    });
  }

  mergeCardObject(targetObject: TCarcassonneGameObject, mergedObject: TCarcassonneCardObject) {
    if (isGameRoad(targetObject) && isCardRoad(mergedObject)) {
      targetObject.inn ||= mergedObject.inn ?? false;
    } else if (isGameCity(targetObject) && isCardCity(mergedObject)) {
      // TODO: merge ends

      targetObject.shields += mergedObject.shields ?? 0;
      targetObject.cathedral ||= mergedObject.cathedral ?? false;

      if (mergedObject.goods) {
        targetObject.goods[mergedObject.goods] = (targetObject.goods[mergedObject.goods] || 0) + 1;
      }
    }
  }

  mergeGameObject(targetObject: TCarcassonneGameObject, mergedObject: TCarcassonneGameObject) {
    const mergeCards = () => {
      targetObject.cards = [...new Set([...targetObject.cards, ...mergedObject.cards])];
    };

    if (isGameField(targetObject) && isGameField(mergedObject)) {
      targetObject.cities = [...new Set([...targetObject.cities, ...mergedObject.cities])];

      mergeCards();
    } else if (isGameRoad(targetObject) && isGameRoad(mergedObject)) {
      // TODO: merge ends

      targetObject.inn ||= mergedObject.inn;

      mergeCards();
    } else if (isGameCity(targetObject) && isGameCity(mergedObject)) {
      // TODO: merge ends

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

  traverseNeighbors(coords: ICoords, callback: (card: ICarcassonneGameCard | undefined) => void) {
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

  onGetGameInfo({ socket }: IGameEvent) {
    socket.emit(ECarcassonneGameEvent.GAME_INFO, this.getGameInfoEvent());
  }

  onAttachCard({ data }: IGameEvent<ICarcassonneAttachCardEvent>) {
    const { card, coords, rotation } = data;
    const activePlayerIndex = this.players.findIndex(({ isActive }) => isActive);
    const activePlayer = this.players[activePlayerIndex];

    this.attachCard(card, coords, rotation);

    const nextActivePlayerIndex = (activePlayerIndex + 1) % this.players.length;
    const newCard = this.deck.pop();

    const cardIndex = activePlayer.cards.findIndex(({ id }) => id === card.id);

    if (cardIndex !== -1) {
      activePlayer.cards.splice(cardIndex, 1);
    }

    if (newCard) {
      activePlayer.cards.push(newCard);
    }

    activePlayer.isActive = false;
    this.players[nextActivePlayerIndex].isActive = true;

    this.io.emit(ECarcassonneGameEvent.GAME_INFO, this.getGameInfoEvent());
  }

  getGameInfoEvent(): ICarcassonneGameInfoEvent {
    return {
      players: this.players,
      board: this.board,
      objects: this.objects,
    };
  }
}

export default CarcassonneGame;
