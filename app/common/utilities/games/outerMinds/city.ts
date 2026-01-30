import { City, CityBuilding } from 'common/types/games/outerMinds';
import { BuildingCell } from 'common/types/games/outerMinds/city';

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
