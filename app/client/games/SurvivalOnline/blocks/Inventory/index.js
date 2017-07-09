import _ from 'lodash';
import { Block, doc } from 'dwayne';
import template from './index.pug';
import { games as gamesConfig } from '../../../../../config/constants.json';

const {
  global: {
    keyCodesToNamesMap
  },
  survival_online: {
    inventory: {
      keysMap: INVENTORY_KEYS_MAP
    }
  }
} = gamesConfig;

const IMAGES_ROOT = '/public/images/games/survival_online';

class SurvivalGameInventory extends Block {
  static template = template();

  isDragging = false;
  INVENTORY_ROOT = `${ IMAGES_ROOT }/inventory`;
  INVENTORY_KEYS_MAP = INVENTORY_KEYS_MAP;

  onDragStart = (index) => {
    this.isDragging = true;

    this.changeInventoryItem(index, {
      dragging: true,
      hover: true
    });
  };

  onDragEnd = (item) => {
    if (!this.isDragging) {
      return;
    }

    this.isDragging = false;
    this.changeInventoryItem(this.findIndexById(item.id), {
      dragging: false,
      hover: false
    });
  };

  onDrop = (index) => {
    if (!this.isDragging) {
      return;
    }

    this.changeInventoryItem(index, {
      hover: false
    });
    this.swapDraggingInventoryItem(index);
  };

  onDragEnter = (index) => {
    if (!this.isDragging) {
      return;
    }

    this.changeInventoryItem(index, {
      hover: true
    });
  };

  onDragLeave = (index) => {
    if (!this.isDragging) {
      return;
    }

    this.changeInventoryItem(index, {
      hover: false
    });
  };

  onRightClick = (e, index) => {
    e.preventDefault();

    this.args.useInventoryItem(index);
  };

  onKeyDown = (e) => {
    const action = keyCodesToNamesMap[e.keyCode];
    const inventoryIndex = _.findIndex(INVENTORY_KEYS_MAP, (key) => key === action);

    this.args.useInventoryItem(inventoryIndex);
  };

  findIndexById(id) {
    return _.findIndex(this.args.inventory, (item) => item && item.id === id);
  }

  changeInventoryItem(index, item) {
    this.args.changeInventory([
      ...this.args.inventory.slice(0, index),
      {
        ...this.args.inventory[index],
        ...item
      },
      ...this.args.inventory.slice(index + 1)
    ]);
  }

  swapDraggingInventoryItem(index) {
    const newInventory = _.cloneDeep(this.args.inventory);
    const draggingIndex = _.findIndex(newInventory, 'dragging');
    const draggingItem = newInventory[draggingIndex];

    newInventory[draggingIndex] = newInventory[index];
    newInventory[index] = draggingItem;
    this.args.changeInventory(newInventory);
  }

  afterRender() {
    this.removeOnKeydown = doc.on('keydown', this.onKeyDown);
  }

  beforeRemove() {
    this.removeOnKeydown();
  }
}

Block.block('SurvivalGameInventory', SurvivalGameInventory);
