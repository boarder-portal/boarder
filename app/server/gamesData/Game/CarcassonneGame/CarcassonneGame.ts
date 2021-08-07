import cloneDeep from 'lodash/cloneDeep';
import times from 'lodash/times';
import shuffle from 'lodash/shuffle';

import { GAMES_CONFIG } from 'common/constants/gamesConfig';

import { IGameEvent } from 'server/types';
import { EGame } from 'common/types/game';
import {
  ECarcassonneCardObject,
  ECarcassonneGameEvent,
  ICarcassonneCard,
  ICarcassonneGameCard,
  ICarcassonneGameInfoEvent,
  ICarcassonneObjectEnd,
  ICarcassonnePlayer,
  TCarcassonneBoard,
  TCarcassonneGameObject,
  TCarcassonneObjects,
} from 'common/types/carcassonne';
import { ICoords, IPlayer } from 'common/types';

import { isCity, isField, isRoad, isSideObject } from 'common/utilities/carcassonne';

import Game, { IGameCreateOptions } from 'server/gamesData/Game/Game';

const {
  games: {
    [EGame.CARCASSONNE]: {
      cards,
    },
  },
} = GAMES_CONFIG;

class CarcassonneGame extends Game<EGame.CARCASSONNE> {
  handlers = {
    [ECarcassonneGameEvent.GET_GAME_INFO]: this.onGetGameInfo,
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
      let isNewObject = true;

      if (isSideObject(object)) {
        object.sideParts.forEach((sidePart) => {
          const objectId = this.getAttachedObjectId({ card: coords, sidePart });

          if (objectId) {
            gameCard.objectsBySideParts[sidePart] = objectId;
            isNewObject = false;

            // TODO: add merge logic, calc ends
          }
        });
      }

      if (isNewObject) {
        const newId = this.lastId++;
        let newObject: TCarcassonneGameObject;

        if (isCity(object)) {
          newObject = {
            id: newId,
            type: ECarcassonneCardObject.CITY,
            cards: [coords],
            shields: object.shields ?? 0,
            cathedral: object.cathedral ?? false,
            goods: object.goods ? { [object.goods]: 1 } : {},
            // TODO: calc ends
            ends: [],
          };
        } else if (isField(object)) {
          newObject = {
            id: newId,
            type: ECarcassonneCardObject.FIELD,
            cards: [coords],
            // TODO: calc cities
            cities: [],
          };
        } else if (isRoad(object)) {
          newObject = {
            id: newId,
            type: ECarcassonneCardObject.ROAD,
            cards: [coords],
            inn: object.inn ?? false,
            // TODO: calc ends
            ends: [],
          };
        } else {
          newObject = {
            id: this.lastId++,
            type: ECarcassonneCardObject.MONASTERY,
            cards: [coords],
          };
        }

        this.objects[newId] = newObject;

        if (isSideObject(object)) {
          object.sideParts.forEach((sidePart) => {
            gameCard.objectsBySideParts[sidePart] = newId;
          });
        }
      }
    });
  }

  createPlayer(roomPlayer: IPlayer): ICarcassonnePlayer {
    return {
      ...roomPlayer,
      isActive: false,
      score: 0,
    };
  }

  createGameInfo() {
    const firstCard = this.deck.shift();

    if (!firstCard) {
      throw new Error('No cards');
    }

    this.attachCard(firstCard, { x: 0, y: 0 }, 0);

    this.deck = shuffle(this.deck);

    const activePlayerIndex = Math.floor(Math.random() * this.players.length);

    this.players = this.players.map((player, index) => ({
      ...player,
      isActive: index === activePlayerIndex,
    }));
  }

  getAttachedObjectId(end: ICarcassonneObjectEnd): number | null {
    const card = this.board[end.card.y]?.[end.card.x];

    if (!card) {
      return null;
    }

    const rotatedSidePart = (end.sidePart + card.rotation * 3) % 12;
    const rotatedSide = Math.floor(rotatedSidePart / 3);
    const delta: ICoords = {
      x: (2 - rotatedSide) % 2,
      y: (rotatedSide - 1) % 2,
    };

    const neighborCard = this.board[card.y + delta.y]?.[card.x + delta.x];

    if (!neighborCard) {
      return null;
    }

    const sidePart = rotatedSide === 0 || rotatedSide === 2
      ? 8 - rotatedSidePart
      : 14 - rotatedSidePart;

    return neighborCard.objectsBySideParts[sidePart];
  }

  onGetGameInfo({ socket }: IGameEvent) {
    const gameInfo: ICarcassonneGameInfoEvent = {
      players: this.players,
      board: this.board,
      objects: this.objects,
    };

    socket.emit(ECarcassonneGameEvent.GAME_INFO, gameInfo);
  }
}

export default CarcassonneGame;
