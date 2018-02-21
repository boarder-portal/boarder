export default {
  dev: true,
  playersCount: 4,
  events: {
    game: {
      HELLO: 'hello',
      GET_INITIAL_INFO: 'get-initial-info',
      MOVE_TO: 'move-to',
      REVERT_MOVE: 'revert-move',
      APPROVE_MOVE: 'approve-move',
      CHANGED_CELLS: 'changed-cells',
      CHANGE_INVENTORY_ITEMS_ORDER: 'change-inventory-items-order',
      CHANGE_INVENTORY_ITEMS: 'change-inventory-items',
      REMOVE_INVENTORY_ITEMS: 'remove-inventory-items',
      USE_INVENTORY_ITEM: 'use-inventory-item',
      CHANGE_TIME: 'change-time'
    }
  },

  development: {
    SHOW_CHUNK_BORDER: false
  },
  limits: {
    densityForChunkToNotBeFrozen: 100
  },
  map: {
    width: 63,
    height: 33
  },
  playerMap: {
    width: 21,
    height: 11
  },
  chunk: {
    width: 21,
    height: 11
  },
  zombie: {
    vision: 10,
    speed: 500
  },
  timers: {
    DELAY_BETWEEN_PLAYER_ACTIONS: 150,
    DELAY_IN_PARTS_OF_SELF_MOVING: 0.2
  },
  intervals: {
    CHANGE_TIME_INTERVAL: 5000
  },
  INITIAL_TIME: 30,
  DAY_DURATION: 100,
  DAY_LITE_PART: 0.7,
  CANT_SEE_THROUGH: ['stone', 'tree'],
  imagesPaths: {
    creatures: {
      player: {
        body: 'creatures/player.png',
        eyes: {
          left: 'eyes/player/left.png',
          right: 'eyes/player/right.png',
          bottom: 'eyes/player/bottom.png'
        }
      },
      zombie: {
        body: 'creatures/zombie.png',
        eyes: {
          left: 'eyes/zombie/left.png',
          right: 'eyes/zombie/right.png',
          bottom: 'eyes/zombie/bottom.png'
        }
      }
    },
    land: {
      grass: 'land/grass.png'
    },
    buildings: {
      tree: 'buildings/tree.png'
    }
  },
  inventory: {
    itemsCount: 10,
    keysMap: [
      '1', '2', '3', '4', '5',
      '6', '7', '8', '9', '0'
    ]
  },
  craft: {

  }
};
