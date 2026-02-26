import {
  BuildingCardDef,
  BuildingCategory,
  CardId,
  TransportBuildingCardId,
  Trip,
} from 'common/types/games/outerMinds/cards';
import { Human } from 'common/types/games/outerMinds/common';

import { areCellsEqual, getCellNeighbors } from 'common/utilities/games/outerMinds/city';

export const TRANSPORT_CARD_DEFS: Record<TransportBuildingCardId, Omit<BuildingCardDef, 'type'>> = {
  [CardId.TAXI_STATION]: {
    isStarting: true,
    isBonus: false,
    category: BuildingCategory.TRANSPORT,
    energy: 1,
    startingHumans: {
      [Human.MAN]: 1,
    },
    getAllPossibleTrips: ({ buildingCell, pointCell }) => {
      const area = [buildingCell, ...getCellNeighbors(buildingCell)];
      const trips: Trip[] = [];

      area.forEach((cell) => {
        if (areCellsEqual(cell, pointCell)) {
          return;
        }

        trips.push(
          {
            from: cell,
            to: pointCell,
          },
          {
            from: pointCell,
            to: cell,
          },
        );
      });

      return trips;
    },
  },
};
