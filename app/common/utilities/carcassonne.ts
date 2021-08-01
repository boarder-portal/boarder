import { GAMES_CONFIG } from 'common/constants/gamesConfig';

import {
  ECarcassonneCardObject,
  ICarcassonneCard,
  ICarcassonneCardCity,
  ICarcassonneCardField,
  ICarcassonneCardMonastery,
  ICarcassonneCardRoad,
  TCarcassonneCardObject,
} from 'common/types/carcassonne';
import { EGame } from 'common/types/game';

export function isCity(object: TCarcassonneCardObject): object is ICarcassonneCardCity {
  return object.type === ECarcassonneCardObject.CITY;
}

export function isRoad(object: TCarcassonneCardObject): object is ICarcassonneCardRoad {
  return object.type === ECarcassonneCardObject.ROAD;
}

export function isField(object: TCarcassonneCardObject): object is ICarcassonneCardField {
  return object.type === ECarcassonneCardObject.FIELD;
}

export function isMonastery(object: TCarcassonneCardObject): object is ICarcassonneCardMonastery {
  return object.type === ECarcassonneCardObject.MONASTERY;
}

export function isSideObject(object: TCarcassonneCardObject): object is ICarcassonneCardCity | ICarcassonneCardRoad | ICarcassonneCardField {
  return isCity(object) || isRoad(object) || isField(object);
}

export function isValidCard(card: ICarcassonneCard): boolean {
  // every side is present only once
  if (
    GAMES_CONFIG.games[EGame.CARCASSONNE].allSides.some((side) => (
      card.objects.filter(isSideObject).filter(({ sides }) => sides.includes(side)).length !== 1
    ))
  ) {
    return false;
  }

  // all field cities are actually cities
  if (
    card.objects.filter(isField).some(({ cities = [] }) => (
      cities.some((id) => !card.objects[id] || !isCity(card.objects[id]))
    ))
  ) {
    return false;
  }

  // all cities are on some field and have 3x sides
  if (
    card.objects.some((object, id) => (
      isCity(object)
      && (
        object.sides.length % 3 !== 0
        || card.objects.filter(isField).every(({ cities = [] }) => !cities.includes(id))
      )
    ))
  ) {
    return false;
  }

  return true;
}
