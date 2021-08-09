import { GAMES_CONFIG } from 'common/constants/gamesConfig';

import {
  ECarcassonneCardObject,
  ICarcassonneCard,
  ICarcassonneCardCity,
  ICarcassonneCardField,
  ICarcassonneCardMonastery,
  ICarcassonneCardRoad,
  ICarcassonneGameCity,
  ICarcassonneGameField,
  ICarcassonneGameMonastery,
  ICarcassonneGameRoad,
  TCarcassonneBoard,
  TCarcassonneCardObject,
  TCarcassonneGameObject,
} from 'common/types/carcassonne';
import { EGame } from 'common/types/game';
import { ICoords } from 'common/types';

export function isCardCity(object: TCarcassonneCardObject): object is ICarcassonneCardCity {
  return object.type === ECarcassonneCardObject.CITY;
}

export function isGameCity(object: TCarcassonneGameObject): object is ICarcassonneGameCity {
  return object.type === ECarcassonneCardObject.CITY;
}

export function isCardRoad(object: TCarcassonneCardObject): object is ICarcassonneCardRoad {
  return object.type === ECarcassonneCardObject.ROAD;
}

export function isGameRoad(object: TCarcassonneGameObject): object is ICarcassonneGameRoad {
  return object.type === ECarcassonneCardObject.ROAD;
}

export function isCardField(object: TCarcassonneCardObject): object is ICarcassonneCardField {
  return object.type === ECarcassonneCardObject.FIELD;
}

export function isGameField(object: TCarcassonneGameObject): object is ICarcassonneGameField {
  return object.type === ECarcassonneCardObject.FIELD;
}

export function isCardMonastery(object: TCarcassonneCardObject): object is ICarcassonneCardMonastery {
  return object.type === ECarcassonneCardObject.MONASTERY;
}

export function isGameMonastery(object: TCarcassonneGameObject): object is ICarcassonneGameMonastery {
  return object.type === ECarcassonneCardObject.MONASTERY;
}

export function isSideObject(object: TCarcassonneCardObject): object is ICarcassonneCardCity | ICarcassonneCardRoad | ICarcassonneCardField {
  return isCardCity(object) || isCardRoad(object) || isCardField(object);
}

export function isValidCard(card: ICarcassonneCard): boolean {
  const getObjectsBySidePart = (sidePart: number) => (
    card.objects.filter(isSideObject).filter(({ sideParts }) => sideParts.includes(sidePart))
  );

  // every side part is present only once
  if (
    GAMES_CONFIG.games[EGame.CARCASSONNE].allSideParts.some((sidePart) => (
      getObjectsBySidePart(sidePart).length !== 1
    ))
  ) {
    console.log('sides error');

    return false;
  }

  // all field cities are actually cities
  if (
    card.objects.filter(isCardField).some(({ cities = [] }) => (
      cities.some((id) => !card.objects[id] || !isCardCity(card.objects[id]))
    ))
  ) {
    console.log('field cities error');

    return false;
  }

  // all cities are on some field and have 3x side parts
  if (
    card.objects.some(isCardField)
    && card.objects.some((object, id) => (
      isCardCity(object)
      && (
        object.sideParts.length % 3 !== 0
        || card.objects.filter(isCardField).every(({ cities = [] }) => !cities.includes(id))
      )
    ))
  ) {
    console.log('cities on fields error');

    return false;
  }

  if (
    card.objects.filter(isCardRoad).some((object) => (
      object.sideParts.some((sidePart) => (
        sidePart % 3 !== 1
        || !isCardField(getObjectsBySidePart(sidePart - 1)[0])
        || !isCardField(getObjectsBySidePart(sidePart + 1)[0])
      ))
    ))
  ) {
    console.log('road/fields error');

    return false;
  }

  return true;
}

export function getNeighborCoords(coords: ICoords, side: number): ICoords {
  return {
    x: coords.x + (2 - side) % 2,
    y: coords.y + (side - 1) % 2,
  };
}

export function getAttachedObjectId(coords: ICoords, sidePart: number, board: TCarcassonneBoard): number | null {
  const side = Math.floor(sidePart / 3);
  const neighborCoords = getNeighborCoords(coords, side);
  const neighborCard = board[neighborCoords.y]?.[neighborCoords.x];

  if (!neighborCard) {
    return null;
  }

  const attachedSidePart = side === 0 || side === 2
    ? 8 - sidePart
    : 14 - sidePart;

  return neighborCard.objectsBySideParts[attachedSidePart];
}
