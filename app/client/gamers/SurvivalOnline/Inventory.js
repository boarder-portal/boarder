import $ from 'jquery';
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ClassName from 'classnames';

import { games as gamesConfig } from '../../../config/constants.json';

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

const INVENTORY_ROOT = '/public/images/games/survival_online/inventory';

class Inventory extends Component {
  static propTypes = {
    inventory: PropTypes.array.isRequired,
    useInventoryItem: PropTypes.func.isRequired,
    changeInventory: PropTypes.func.isRequired
  };

  isDragging = false;

  componentDidMount() {
    $(document).on('keydown', this.onKeyDown);
  }

  componentWillUnmount() {
    $(document).off('keydown', this.onKeyDown);
  }

  onDragStart = (index) => {
    this.isDragging = true;

    this.changeInventoryItem(index, {
      beforeDragging: true
    });

    setTimeout(() => {
      this.changeInventoryItem(index, {
        beforeDragging: false,
        dragging: true,
        hover: true
      });
    }, 0);
  };

  onDragEnd = (item) => {
    if (!this.isDragging) {
      return;
    }

    this.isDragging = false;

    setTimeout(() => {
      this.changeInventoryItem(this.findIndexById(item.id), {
        dragging: false,
        hover: false
      });
    }, 0);
  };

  onDrop = (index) => {
    if (!this.isDragging) {
      return;
    }

    this.changeInventoryItem(index, {
      hover: false
    });

    const draggingIndex = _.findIndex(this.props.inventory, 'dragging');

    setTimeout(() => {
      this.swapDraggingInventoryItem(index, draggingIndex);
    }, 0);
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

    this.props.useInventoryItem(index);
  };

  onKeyDown = (e) => {
    const action = keyCodesToNamesMap[e.keyCode];
    const inventoryIndex = _.findIndex(INVENTORY_KEYS_MAP, (key) => key === action);

    this.props.useInventoryItem(inventoryIndex);
  };

  findIndexById(id) {
    return _.findIndex(this.props.inventory, (item) => item && item.id === id);
  }

  changeInventoryItem(index, item) {
    const {
      inventory,
      changeInventory
    } = this.props;

    changeInventory([
      ...inventory.slice(0, index),
      {
        ...inventory[index],
        ...item
      },
      ...inventory.slice(index + 1)
    ]);
  }

  swapDraggingInventoryItem(index, draggingIndex) {
    const {
      inventory,
      changeInventory
    } = this.props;
    const newInventory = _.cloneDeep(inventory);
    const draggingItem = {
      ...newInventory[draggingIndex],
      dragging: false,
      hover: false
    };

    newInventory[draggingIndex] = newInventory[index];
    newInventory[index] = draggingItem;

    changeInventory(newInventory);
  }

  render() {
    const {
      inventory
    } = this.props;

    return (
      <div className="inventory">
        {inventory.map((item, index) => (
          <div
            key={item.empty ? `ix-${index}` : item.id}
            className={ClassName('inventory-item-container', {
              empty: item.empty,
              'before-drop': item.hover
            })}
            draggable="false"
            onDragOver={(e) => e.preventDefault()}
            onDragEnter={() => this.onDragEnter(index)}
            onDragLeave={() => this.onDragLeave(index)}
            onDrop={() => this.onDrop(index)}
          >
            {!item.empty && (
              <div
                className={ClassName('inventory-item', {
                  dragging: item.dragging
                })}
                draggable="true"
                onDragStart={() => this.onDragStart(index)}
                onDragEnd={() => this.onDragEnd(item)}
                onContextMenu={(e) => this.onRightClick(e, index)}
              >
                <img
                  className="inventory-item-image"
                  src={`${INVENTORY_ROOT}/${item.type}.png`}
                />
                <label className="inventory-item-count">
                  {item.count}
                </label>
                <div className="draggable-overlay" />
              </div>
            )}
            {!item.beforeDragging && (
              <label className="key" draggable="false">
                {INVENTORY_KEYS_MAP[index]}
              </label>
            )}
          </div>
        ))}
      </div>
    );
  }
}

export default Inventory;
