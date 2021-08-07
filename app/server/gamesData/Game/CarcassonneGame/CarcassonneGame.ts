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

    card.objects.forEach((object) => {
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
                this.mergeObjects(gameObject, object);

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
            shields: object.shields ?? 0,
            cathedral: object.cathedral ?? false,
            goods: object.goods ? { [object.goods]: 1 } : {},
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
            inn: object.inn ?? false,
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
        gameObject.cards.push(coords);

        if (isSideObject(object)) {
          for (const sidePart of object.sideParts) {
            const rotatedSidePart = (sidePart + 3 * rotation) % 12;

            gameCard.objectsBySideParts[rotatedSidePart] = gameObject.id;
          }
        }
      }
    });
  }

  createPlayer(roomPlayer: IPlayer): ICarcassonnePlayer {
    return {
      ...roomPlayer,
      isActive: false,
      score: 0,
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

  mergeObjects(targetObject: TCarcassonneGameObject, mergedObject: TCarcassonneGameObject) {
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
          object.cities = object.cities.filter((cityId) => cityId !== targetObject.id);

          if (!object.cities.includes(targetObject.id)) {
            object.cities.push(targetObject.id);
          }
        }
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
