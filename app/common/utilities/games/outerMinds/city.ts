import { CITY_HEIGHT, CITY_WIDTH } from 'common/constants/games/outerMinds/city';

import {
  BuildingCell,
  BuildingCellWithBuilding,
  City,
  CityBuilding,
  CityQuadrant,
} from 'common/types/games/outerMinds/city';

export type CityBuildingCallback<ReturnValue = unknown> = (cellWithBuilding: BuildingCellWithBuilding) => ReturnValue;

type CityBuildingInternalCallback = (cellWithBuilding: BuildingCellWithBuilding) => boolean | void;

function cityForEach(city: City, callback: CityBuildingInternalCallback): boolean {
  for (const [rowNumber, row] of city.entries()) {
    for (const [colNumber, building] of row.entries()) {
      if (
        callback({
          row: rowNumber,
          col: colNumber,
          building,
        })
      ) {
        return true;
      }
    }
  }

  return false;
}

export function iterateCity(city: City, callback: CityBuildingCallback): void {
  cityForEach(city, (cellWithBuilding) => {
    callback(cellWithBuilding);
  });
}

export function citySome(city: City, callback: CityBuildingCallback<boolean>): boolean {
  return cityForEach(city, callback);
}

export function getCityCellBuilding(city: City, cell: BuildingCell): CityBuilding {
  return city[cell.row][cell.col];
}

export function getCellCityQuadrant(cell: BuildingCell): CityQuadrant {
  const isWest = cell.col < CITY_WIDTH / 2;

  return cell.row < CITY_HEIGHT / 2
    ? isWest
      ? CityQuadrant.NORTH_WEST
      : CityQuadrant.NORTH_EAST
    : isWest
    ? CityQuadrant.SOUTH_WEST
    : CityQuadrant.SOUTH_EAST;
}

export function iterateCityQuadrant(city: City, quadrant: CityQuadrant, callback: CityBuildingCallback): void {
  cityForEach(city, (cellWithBuilding) => {
    if (getCellCityQuadrant(cellWithBuilding) === quadrant) {
      callback(cellWithBuilding);
    }
  });
}

export function getCellNeighbors(cell: BuildingCell): BuildingCell[] {
  const neighbors: BuildingCell[] = [];

  if (cell.col > 0) {
    neighbors.push({
      row: cell.row,
      col: cell.col - 1,
    });
  }

  if (cell.row > 0) {
    neighbors.push({
      row: cell.row - 1,
      col: cell.col,
    });
  }

  if (cell.col < CITY_WIDTH - 1) {
    neighbors.push({
      row: cell.row,
      col: cell.col + 1,
    });
  }

  if (cell.row < CITY_HEIGHT - 1) {
    neighbors.push({
      row: cell.row + 1,
      col: cell.col,
    });
  }

  return neighbors;
}

export function getOtherRowCells(cell: BuildingCell): BuildingCell[] {
  const rowCells: BuildingCell[] = [];

  for (let col = 0; col < CITY_WIDTH; col++) {
    if (col === cell.col) {
      continue;
    }

    rowCells.push({
      row: cell.row,
      col,
    });
  }

  return rowCells;
}

export function getOtherColCells(cell: BuildingCell): BuildingCell[] {
  const colCells: BuildingCell[] = [];

  for (let row = 0; row < CITY_HEIGHT; row++) {
    if (row === cell.row) {
      continue;
    }

    colCells.push({
      row,
      col: cell.col,
    });
  }

  return colCells;
}

export function areCellsEqual(cell1: BuildingCell, cell2: BuildingCell): boolean {
  return cell1.row === cell2.row && cell1.col === cell2.col;
}
