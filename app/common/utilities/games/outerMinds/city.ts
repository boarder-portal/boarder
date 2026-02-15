import { CITY_HEIGHT, CITY_WIDTH } from 'common/constants/games/outerMinds/city';

import { BuildingCell, City, CityBuilding, CityQuadrant } from 'common/types/games/outerMinds/city';

export type CityBuildingCallback<ReturnValue = unknown> = (building: CityBuilding, cell: BuildingCell) => ReturnValue;

type CityBuildingInternalCallback = (building: CityBuilding, cell: BuildingCell) => boolean | void;

function cityForEach(city: City, callback: CityBuildingInternalCallback): boolean {
  for (const [rowNumber, row] of city.entries()) {
    for (const [colNumber, building] of row.entries()) {
      if (
        callback(building, {
          row: rowNumber,
          col: colNumber,
        })
      ) {
        return true;
      }
    }
  }

  return false;
}

export function iterateCity(city: City, callback: CityBuildingCallback): void {
  cityForEach(city, (building, cell) => {
    callback(building, cell);
  });
}

export function citySome(city: City, callback: CityBuildingCallback<boolean>): boolean {
  return cityForEach(city, callback);
}

export function isBuildingInQuadrant(cell: BuildingCell, quadrant: CityQuadrant): boolean {
  if (quadrant === CityQuadrant.NORTH_WEST) {
    return cell.row < CITY_HEIGHT / 2 && cell.col < CITY_WIDTH / 2;
  }

  if (quadrant === CityQuadrant.NORTH_EAST) {
    return cell.row < CITY_HEIGHT / 2 && cell.col >= CITY_WIDTH / 2;
  }

  if (quadrant === CityQuadrant.SOUTH_WEST) {
    return cell.row >= CITY_HEIGHT / 2 && cell.col < CITY_WIDTH / 2;
  }

  if (quadrant === CityQuadrant.SOUTH_EAST) {
    return cell.row >= CITY_HEIGHT / 2 && cell.col >= CITY_WIDTH / 2;
  }

  return false;
}

export function iterateCityQuadrant(city: City, quadrant: CityQuadrant, callback: CityBuildingCallback): void {
  cityForEach(city, (building, cell) => {
    if (isBuildingInQuadrant(cell, quadrant)) {
      callback(building, cell);
    }
  });
}
