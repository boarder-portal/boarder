import { ALL_SIDE_PARTS } from 'common/constants/games/carcassonne';

import { Coords } from 'common/types';
import {
  Board,
  Card,
  CardCity,
  CardField,
  CardMonastery,
  CardObject,
  CardObjectType,
  CardRoad,
  GameCity,
  GameField,
  GameMonastery,
  GameObject,
  GameRoad,
  PlayerMeeple,
} from 'common/types/carcassonne';

export function isCardCity(object: CardObject): object is CardCity {
  return object.type === CardObjectType.CITY;
}

export function isGameCity(object: GameObject): object is GameCity {
  return object.type === CardObjectType.CITY;
}

export function isCardRoad(object: CardObject): object is CardRoad {
  return object.type === CardObjectType.ROAD;
}

export function isGameRoad(object: GameObject): object is GameRoad {
  return object.type === CardObjectType.ROAD;
}

export function isCardField(object: CardObject): object is CardField {
  return object.type === CardObjectType.FIELD;
}

export function isGameField(object: GameObject): object is GameField {
  return object.type === CardObjectType.FIELD;
}

export function isCardMonastery(object: CardObject): object is CardMonastery {
  return object.type === CardObjectType.MONASTERY;
}

export function isGameMonastery(object: GameObject): object is GameMonastery {
  return object.type === CardObjectType.MONASTERY;
}

export function isSideObject(object: CardObject): object is CardCity | CardRoad | CardField {
  return isCardCity(object) || isCardRoad(object) || isCardField(object);
}

export function isValidCard(card: Card): boolean {
  const getObjectsBySidePart = (sidePart: number) =>
    card.objects.filter(isSideObject).filter(({ sideParts }) => sideParts.includes(sidePart));

  // every side part is present only once
  if (ALL_SIDE_PARTS.some((sidePart) => getObjectsBySidePart(sidePart).length !== 1)) {
    console.log('sides error');

    return false;
  }

  // all field cities are actually cities
  if (
    card.objects
      .filter(isCardField)
      .some(({ cities = [] }) => cities.some((id) => !card.objects[id] || !isCardCity(card.objects[id])))
  ) {
    console.log('field cities error');

    return false;
  }

  // all cities are on some field and have 3x side parts
  if (
    card.objects.some(isCardField) &&
    card.objects.some(
      (object, id) =>
        isCardCity(object) &&
        (object.sideParts.length % 3 !== 0 ||
          card.objects.filter(isCardField).every(({ cities = [] }) => !cities.includes(id))),
    )
  ) {
    console.log('cities on fields error');

    return false;
  }

  if (
    card.objects
      .filter(isCardRoad)
      .some((object) =>
        object.sideParts.some(
          (sidePart) =>
            sidePart % 3 !== 1 ||
            !isCardField(getObjectsBySidePart(sidePart - 1)[0]) ||
            !isCardField(getObjectsBySidePart(sidePart + 1)[0]),
        ),
      )
  ) {
    console.log('road/fields error');

    return false;
  }

  return true;
}

export function getNeighborCoords(coords: Coords, side: number): Coords {
  return {
    x: coords.x + ((2 - side) % 2),
    y: coords.y + ((side - 1) % 2),
  };
}

export function getAttachedObjectId(coords: Coords, sidePart: number, board: Board): number | null {
  const side = Math.floor(sidePart / 3);
  const neighborCoords = getNeighborCoords(coords, side);
  const neighborCard = board[neighborCoords.y]?.[neighborCoords.x];

  if (!neighborCard) {
    return null;
  }

  const attachedSidePart = side === 0 || side === 2 ? 8 - sidePart : 14 - sidePart;

  return neighborCard.objectsBySideParts[attachedSidePart];
}

export function getObjectPlayerMeeples(object: GameObject, playerIndex: number): PlayerMeeple[] {
  return object.meeples.filter((meeple) => meeple.playerIndex === playerIndex);
}
