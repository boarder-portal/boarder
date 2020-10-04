import times from 'lodash/times';

import { GAMES_CONFIG } from 'common/constants/gamesConfig';
import { OBJECT_PIXELS } from 'client/pages/Game/components/SurvivalOnlineGame/constants/objectPixels';

import { EGame } from 'common/types';

import renderObject from 'client/pages/Game/components/SurvivalOnlineGame/utilities/renderObject';

const {
  games: {
    [EGame.SURVIVAL_ONLINE]: {
      viewSize,
      inventoryItemsCount,
      cellSize,
      colors: {
        bananaMania,
      },
    },
  },
} = GAMES_CONFIG;

const INVENTORY_CELL_SIZE = 1;

const INVENTORY_START_X = (viewSize.width - inventoryItemsCount * INVENTORY_CELL_SIZE) / 2 * cellSize;
const INVENTORY_START_Y = (viewSize.height - INVENTORY_CELL_SIZE) * cellSize;
const BORDER_SIZE = 2;

const INVENTORY_WIDTH = inventoryItemsCount * cellSize;
const INVENTORY_HEIGHT = INVENTORY_CELL_SIZE * cellSize;

export default function renderInventory(context: CanvasRenderingContext2D) {
  renderObject({
    context,
    startX: INVENTORY_START_X,
    startY: INVENTORY_START_Y,
    rects: [
      { x: 0, y: 0, width: 1, height: 1, color: bananaMania },
    ],
    width: INVENTORY_WIDTH,
    height: INVENTORY_HEIGHT,
  });

  times(inventoryItemsCount, (index) => {
    renderObject({
      context,
      startX: INVENTORY_START_X + index * INVENTORY_CELL_SIZE * cellSize,
      startY: INVENTORY_START_Y,
      rects: index % 2 ? OBJECT_PIXELS.tree : OBJECT_PIXELS.base,
      width: INVENTORY_CELL_SIZE * cellSize,
      height: INVENTORY_CELL_SIZE * cellSize,
    });
  });

  renderObject({
    context,
    startX: INVENTORY_START_X,
    startY: INVENTORY_START_Y,
    rects: [
      { x: 0, y: 0, width: 1, height: { value: BORDER_SIZE }, color: 'black' },
      { x: 0, y: 1 - BORDER_SIZE / INVENTORY_HEIGHT, width: 1, height: { value: BORDER_SIZE }, color: 'black' },
      { x: 0, y: 0, width: { value: BORDER_SIZE }, height: 1, color: 'black' },
      ...times(inventoryItemsCount, (index) => ({
        x: 1 / inventoryItemsCount * (index + 1) - BORDER_SIZE / INVENTORY_WIDTH,
        y: 0,
        width: { value: BORDER_SIZE },
        height: 1,
        color: 'black',
      })),
    ],
    width: INVENTORY_WIDTH,
    height: INVENTORY_HEIGHT,
  });
}
