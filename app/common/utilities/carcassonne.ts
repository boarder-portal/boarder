import { ALL_SIDE_PARTS } from 'common/constants/games/carcassonne';

import {
  ECardObject,
  ICard,
  ICardCity,
  ICardField,
  ICardMonastery,
  ICardRoad,
  IGameCity,
  IGameField,
  IGameMonastery,
  IGameRoad,
  IPlayerMeeple,
  TBoard,
  TCardObject,
  TGameObject,
} from 'common/types/carcassonne';
import { ICoords } from 'common/types';

export function isCardCity(object: TCardObject): object is ICardCity {
  return object.type === ECardObject.CITY;
}

export function isGameCity(object: TGameObject): object is IGameCity {
  return object.type === ECardObject.CITY;
}

export function isCardRoad(object: TCardObject): object is ICardRoad {
  return object.type === ECardObject.ROAD;
}

export function isGameRoad(object: TGameObject): object is IGameRoad {
  return object.type === ECardObject.ROAD;
}

export function isCardField(object: TCardObject): object is ICardField {
  return object.type === ECardObject.FIELD;
}

export function isGameField(object: TGameObject): object is IGameField {
  return object.type === ECardObject.FIELD;
}

export function isCardMonastery(object: TCardObject): object is ICardMonastery {
  return object.type === ECardObject.MONASTERY;
}

export function isGameMonastery(object: TGameObject): object is IGameMonastery {
  return object.type === ECardObject.MONASTERY;
}

export function isSideObject(object: TCardObject): object is ICardCity | ICardRoad | ICardField {
  return isCardCity(object) || isCardRoad(object) || isCardField(object);
}

export function isValidCard(card: ICard): boolean {
  const getObjectsBySidePart = (sidePart: number) => (
    card.objects.filter(isSideObject).filter(({ sideParts }) => sideParts.includes(sidePart))
  );

  // every side part is present only once
  if (
    ALL_SIDE_PARTS.some((sidePart) => (
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

export function getAttachedObjectId(coords: ICoords, sidePart: number, board: TBoard): number | null {
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

export function getObjectPlayerMeeples(object: TGameObject, playerIndex: number): IPlayerMeeple[] {
  return object.meeples.filter((meeple) => meeple.playerIndex === playerIndex);
}
