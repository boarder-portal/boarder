import times from 'lodash/times';

import {
  CELL_SIZE,
  COLORS,
  INVENTORY_ITEMS_COUNT,
  VIEW_SIZE,
} from 'common/constants/games/survivalOnline';
import { OBJECT_PIXELS } from 'client/pages/Game/components/SurvivalOnlineGame/constants/objectPixels';

import renderObject from 'client/pages/Game/components/SurvivalOnlineGame/utilities/renderObject';

const {
  bananaMania,
} = COLORS;

const INVENTORY_CELL_SIZE = 1;

const INVENTORY_START_X = (VIEW_SIZE.width - INVENTORY_ITEMS_COUNT * INVENTORY_CELL_SIZE) / 2 * CELL_SIZE;
const INVENTORY_START_Y = (VIEW_SIZE.height - INVENTORY_CELL_SIZE) * CELL_SIZE;
const BORDER_SIZE = 2;

const INVENTORY_WIDTH = INVENTORY_ITEMS_COUNT * CELL_SIZE;
const INVENTORY_HEIGHT = INVENTORY_CELL_SIZE * CELL_SIZE;

export default function renderInventory(context: CanvasRenderingContext2D): void {
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

  times(INVENTORY_ITEMS_COUNT, (index) => {
    renderObject({
      context,
      startX: INVENTORY_START_X + index * INVENTORY_CELL_SIZE * CELL_SIZE,
      startY: INVENTORY_START_Y,
      rects: index % 2 ? OBJECT_PIXELS.tree : OBJECT_PIXELS.base,
      width: INVENTORY_CELL_SIZE * CELL_SIZE,
      height: INVENTORY_CELL_SIZE * CELL_SIZE,
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
      ...times(INVENTORY_ITEMS_COUNT, (index) => ({
        x: 1 / INVENTORY_ITEMS_COUNT * (index + 1) - BORDER_SIZE / INVENTORY_WIDTH,
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
