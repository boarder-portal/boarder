import {
  ESevenWonderCardId,
  ESevenWondersCardType,
  ESevenWondersPlayerDirection,
  ISevenWondersCard,
} from 'common/types/sevenWonders/cards';
import { ISevenWondersEffect } from 'common/types/sevenWonders/effects';
import {
  ESevenWondersNeighborSide,
  ESevenWondersResource,
  ESevenWondersScientificSymbol,
} from 'common/types/sevenWonders';

const CARDS_BY_AGE: ISevenWondersCard[][] = [
  // age 1
  [{
    // manufactured goods
    id: ESevenWonderCardId.LOOM,
    type: ESevenWondersCardType.MANUFACTURED_GOODS,
    effects: [{
      type: ISevenWondersEffect.RESOURCES,
      variants: [{
        type: ESevenWondersResource.LOOM,
        count: 1,
      }],
    }],
    minPlayersCounts: [3, 6],
  }, {
    id: ESevenWonderCardId.GLASSWORKS,
    type: ESevenWondersCardType.MANUFACTURED_GOODS,
    effects: [{
      type: ISevenWondersEffect.RESOURCES,
      variants: [{
        type: ESevenWondersResource.GLASS,
        count: 1,
      }],
    }],
    minPlayersCounts: [3, 6],
  }, {
    id: ESevenWonderCardId.PRESS,
    type: ESevenWondersCardType.MANUFACTURED_GOODS,
    effects: [{
      type: ISevenWondersEffect.RESOURCES,
      variants: [{
        type: ESevenWondersResource.PAPYRUS,
        count: 1,
      }],
    }],
    minPlayersCounts: [3, 6],
  },

  // raw materials
  {
    id: ESevenWonderCardId.LUMBER_YARD,
    type: ESevenWondersCardType.RAW_MATERIAL,
    effects: [{
      type: ISevenWondersEffect.RESOURCES,
      variants: [{
        type: ESevenWondersResource.WOOD,
        count: 1,
      }],
    }],
    minPlayersCounts: [3, 4],
  }, {
    id: ESevenWonderCardId.STONE_PIT,
    type: ESevenWondersCardType.RAW_MATERIAL,
    effects: [{
      type: ISevenWondersEffect.RESOURCES,
      variants: [{
        type: ESevenWondersResource.STONE,
        count: 1,
      }],
    }],
    minPlayersCounts: [3, 5],
  }, {
    id: ESevenWonderCardId.CLAY_POOL,
    type: ESevenWondersCardType.RAW_MATERIAL,
    effects: [{
      type: ISevenWondersEffect.RESOURCES,
      variants: [{
        type: ESevenWondersResource.CLAY,
        count: 1,
      }],
    }],
    minPlayersCounts: [3, 5],
  }, {
    id: ESevenWonderCardId.ORE_VEIN,
    type: ESevenWondersCardType.RAW_MATERIAL,
    effects: [{
      type: ISevenWondersEffect.RESOURCES,
      variants: [{
        type: ESevenWondersResource.ORE,
        count: 1,
      }],
    }],
    minPlayersCounts: [3, 4],
  }, {
    id: ESevenWonderCardId.TREE_FARM,
    type: ESevenWondersCardType.RAW_MATERIAL,
    effects: [{
      type: ISevenWondersEffect.RESOURCES,
      variants: [{
        type: ESevenWondersResource.WOOD,
        count: 1,
      }, {
        type: ESevenWondersResource.CLAY,
        count: 1,
      }],
    }],
    price: {
      coins: 1,
    },
    minPlayersCounts: [6],
  }, {
    id: ESevenWonderCardId.EXCAVATION,
    type: ESevenWondersCardType.RAW_MATERIAL,
    effects: [{
      type: ISevenWondersEffect.RESOURCES,
      variants: [{
        type: ESevenWondersResource.STONE,
        count: 1,
      }, {
        type: ESevenWondersResource.CLAY,
        count: 1,
      }],
    }],
    price: {
      coins: 1,
    },
    minPlayersCounts: [4],
  }, {
    id: ESevenWonderCardId.CLAY_PIT,
    type: ESevenWondersCardType.RAW_MATERIAL,
    effects: [{
      type: ISevenWondersEffect.RESOURCES,
      variants: [{
        type: ESevenWondersResource.CLAY,
        count: 1,
      }, {
        type: ESevenWondersResource.ORE,
        count: 1,
      }],
    }],
    price: {
      coins: 1,
    },
    minPlayersCounts: [3],
  }, {
    id: ESevenWonderCardId.TIMBER_YARD,
    type: ESevenWondersCardType.RAW_MATERIAL,
    effects: [{
      type: ISevenWondersEffect.RESOURCES,
      variants: [{
        type: ESevenWondersResource.STONE,
        count: 1,
      }, {
        type: ESevenWondersResource.WOOD,
        count: 1,
      }],
    }],
    price: {
      coins: 1,
    },
    minPlayersCounts: [3],
  }, {
    id: ESevenWonderCardId.FOREST_CAVE,
    type: ESevenWondersCardType.RAW_MATERIAL,
    effects: [{
      type: ISevenWondersEffect.RESOURCES,
      variants: [{
        type: ESevenWondersResource.WOOD,
        count: 1,
      }, {
        type: ESevenWondersResource.ORE,
        count: 1,
      }],
    }],
    price: {
      coins: 1,
    },
    minPlayersCounts: [5],
  }, {
    id: ESevenWonderCardId.MINE,
    type: ESevenWondersCardType.RAW_MATERIAL,
    effects: [{
      type: ISevenWondersEffect.RESOURCES,
      variants: [{
        type: ESevenWondersResource.ORE,
        count: 1,
      }, {
        type: ESevenWondersResource.STONE,
        count: 1,
      }],
    }],
    price: {
      coins: 1,
    },
    minPlayersCounts: [6],
  },

  // civilian

  {
    id: ESevenWonderCardId.PAWNSHOP,
    type: ESevenWondersCardType.CIVILIAN,
    effects: [{
      type: ISevenWondersEffect.GAIN,
      gain: {
        points: 3,
      },
    }],
    minPlayersCounts: [4, 7],
  }, {
    id: ESevenWonderCardId.BATHS,
    type: ESevenWondersCardType.CIVILIAN,
    effects: [{
      type: ISevenWondersEffect.GAIN,
      gain: {
        points: 3,
      },
    }],
    price: {
      resources: [{
        type: ESevenWondersResource.STONE,
        count: 1,
      }],
    },
    minPlayersCounts: [3, 7],
  }, {
    id: ESevenWonderCardId.ALTAR,
    type: ESevenWondersCardType.CIVILIAN,
    effects: [{
      type: ISevenWondersEffect.GAIN,
      gain: {
        points: 2,
      },
    }],
    minPlayersCounts: [3, 5],
  }, {
    id: ESevenWonderCardId.THEATER,
    type: ESevenWondersCardType.CIVILIAN,
    effects: [{
      type: ISevenWondersEffect.GAIN,
      gain: {
        points: 2,
      },
    }],
    minPlayersCounts: [3, 6],
  },

  // commercial

  {
    id: ESevenWonderCardId.TAVERN,
    type: ESevenWondersCardType.COMMERCIAL,
    effects: [{
      type: ISevenWondersEffect.GAIN,
      gain: {
        coins: 5,
      },
    }],
    minPlayersCounts: [4, 5, 7],
  }, {
    id: ESevenWonderCardId.EAST_TRADING_POST,
    type: ESevenWondersCardType.COMMERCIAL,
    effects: [{
      type: ISevenWondersEffect.TRADE,
      neighbors: [ESevenWondersNeighborSide.RIGHT],
      price: 1,
      resource: ESevenWondersCardType.RAW_MATERIAL,
    }],
    minPlayersCounts: [3, 7],
  }, {
    id: ESevenWonderCardId.WEST_TRADING_POST,
    type: ESevenWondersCardType.COMMERCIAL,
    effects: [{
      type: ISevenWondersEffect.TRADE,
      neighbors: [ESevenWondersNeighborSide.LEFT],
      price: 1,
      resource: ESevenWondersCardType.RAW_MATERIAL,
    }],
    minPlayersCounts: [3, 7],
  }, {
    id: ESevenWonderCardId.MARKETPLACE,
    type: ESevenWondersCardType.COMMERCIAL,
    effects: [{
      type: ISevenWondersEffect.TRADE,
      neighbors: [ESevenWondersNeighborSide.LEFT, ESevenWondersNeighborSide.RIGHT],
      price: 1,
      resource: ESevenWondersCardType.MANUFACTURED_GOODS,
    }],
    minPlayersCounts: [3, 6],
  },

  // military

  {
    id: ESevenWonderCardId.STOCKADE,
    type: ESevenWondersCardType.MILITARY,
    effects: [{
      type: ISevenWondersEffect.SHIELDS,
      count: 1,
    }],
    price: {
      resources: [{
        type: ESevenWondersResource.WOOD,
        count: 1,
      }],
    },
    minPlayersCounts: [3, 7],
  }, {
    id: ESevenWonderCardId.BARRACKS,
    type: ESevenWondersCardType.MILITARY,
    effects: [{
      type: ISevenWondersEffect.SHIELDS,
      count: 1,
    }],
    price: {
      resources: [{
        type: ESevenWondersResource.ORE,
        count: 1,
      }],
    },
    minPlayersCounts: [3, 5],
  }, {
    id: ESevenWonderCardId.GUARD_TOWER,
    type: ESevenWondersCardType.MILITARY,
    effects: [{
      type: ISevenWondersEffect.SHIELDS,
      count: 1,
    }],
    price: {
      resources: [{
        type: ESevenWondersResource.CLAY,
        count: 1,
      }],
    },
    minPlayersCounts: [3, 4],
  },

  // scientific

  {
    id: ESevenWonderCardId.APOTHECARY,
    type: ESevenWondersCardType.SCIENTIFIC,
    effects: [{
      type: ISevenWondersEffect.SCIENTIFIC_SYMBOLS,
      variants: [ESevenWondersScientificSymbol.COMPASS],
    }],
    price: {
      resources: [{
        type: ESevenWondersResource.LOOM,
        count: 1,
      }],
    },
    minPlayersCounts: [3, 5],
  }, {
    id: ESevenWonderCardId.WORKSHOP,
    type: ESevenWondersCardType.SCIENTIFIC,
    effects: [{
      type: ISevenWondersEffect.SCIENTIFIC_SYMBOLS,
      variants: [ESevenWondersScientificSymbol.GEAR],
    }],
    price: {
      resources: [{
        type: ESevenWondersResource.GLASS,
        count: 1,
      }],
    },
    minPlayersCounts: [3, 7],
  }, {
    id: ESevenWonderCardId.SCRIPTORIUM,
    type: ESevenWondersCardType.SCIENTIFIC,
    effects: [{
      type: ISevenWondersEffect.SCIENTIFIC_SYMBOLS,
      variants: [ESevenWondersScientificSymbol.TABLET],
    }],
    price: {
      resources: [{
        type: ESevenWondersResource.PAPYRUS,
        count: 1,
      }],
    },
    minPlayersCounts: [3, 4],
  }],

  // age 2
  [{
    // manufactured goods
    id: ESevenWonderCardId.LOOM,
    type: ESevenWondersCardType.MANUFACTURED_GOODS,
    effects: [{
      type: ISevenWondersEffect.RESOURCES,
      variants: [{
        type: ESevenWondersResource.LOOM,
        count: 1,
      }],
    }],
    minPlayersCounts: [3, 5],
  }, {
    id: ESevenWonderCardId.GLASSWORKS,
    type: ESevenWondersCardType.MANUFACTURED_GOODS,
    effects: [{
      type: ISevenWondersEffect.RESOURCES,
      variants: [{
        type: ESevenWondersResource.GLASS,
        count: 1,
      }],
    }],
    minPlayersCounts: [3, 5],
  }, {
    id: ESevenWonderCardId.PRESS,
    type: ESevenWondersCardType.MANUFACTURED_GOODS,
    effects: [{
      type: ISevenWondersEffect.RESOURCES,
      variants: [{
        type: ESevenWondersResource.PAPYRUS,
        count: 1,
      }],
    }],
    minPlayersCounts: [3, 5],
  },

  // raw materials
  {
    id: ESevenWonderCardId.SAWMILL,
    type: ESevenWondersCardType.RAW_MATERIAL,
    effects: [{
      type: ISevenWondersEffect.RESOURCES,
      variants: [{
        type: ESevenWondersResource.WOOD,
        count: 2,
      }],
    }],
    price: {
      coins: 1,
    },
    minPlayersCounts: [3, 4],
  }, {
    id: ESevenWonderCardId.QUARRY,
    type: ESevenWondersCardType.RAW_MATERIAL,
    effects: [{
      type: ISevenWondersEffect.RESOURCES,
      variants: [{
        type: ESevenWondersResource.STONE,
        count: 2,
      }],
    }],
    price: {
      coins: 1,
    },
    minPlayersCounts: [3, 4],
  }, {
    id: ESevenWonderCardId.BRICKYARD,
    type: ESevenWondersCardType.RAW_MATERIAL,
    effects: [{
      type: ISevenWondersEffect.RESOURCES,
      variants: [{
        type: ESevenWondersResource.CLAY,
        count: 1,
      }],
    }],
    price: {
      coins: 1,
    },
    minPlayersCounts: [3, 4],
  }, {
    id: ESevenWonderCardId.FOUNDRY,
    type: ESevenWondersCardType.RAW_MATERIAL,
    effects: [{
      type: ISevenWondersEffect.RESOURCES,
      variants: [{
        type: ESevenWondersResource.ORE,
        count: 2,
      }],
    }],
    price: {
      coins: 1,
    },
    minPlayersCounts: [3, 4],
  },

  // civilian

  {
    id: ESevenWonderCardId.AQUEDUCT,
    type: ESevenWondersCardType.CIVILIAN,
    effects: [{
      type: ISevenWondersEffect.GAIN,
      gain: {
        points: 5,
      },
    }],
    price: {
      resources: [{
        type: ESevenWondersResource.STONE,
        count: 3,
      }],
    },
    minPlayersCounts: [3, 7],
  }, {
    id: ESevenWonderCardId.TEMPLE,
    type: ESevenWondersCardType.CIVILIAN,
    effects: [{
      type: ISevenWondersEffect.GAIN,
      gain: {
        points: 3,
      },
    }],
    price: {
      resources: [{
        type: ESevenWondersResource.WOOD,
        count: 1,
      }, {
        type: ESevenWondersResource.CLAY,
        count: 1,
      }, {
        type: ESevenWondersResource.GLASS,
        count: 1,
      }],
    },
    minPlayersCounts: [3, 6],
  }, {
    id: ESevenWonderCardId.STATUE,
    type: ESevenWondersCardType.CIVILIAN,
    effects: [{
      type: ISevenWondersEffect.GAIN,
      gain: {
        points: 4,
      },
    }],
    price: {
      resources: [{
        type: ESevenWondersResource.WOOD,
        count: 1,
      }, {
        type: ESevenWondersResource.ORE,
        count: 2,
      }],
    },
    minPlayersCounts: [3, 7],
  }, {
    id: ESevenWonderCardId.COURTHOUSE,
    type: ESevenWondersCardType.CIVILIAN,
    effects: [{
      type: ISevenWondersEffect.GAIN,
      gain: {
        points: 4,
      },
    }],
    price: {
      resources: [{
        type: ESevenWondersResource.CLAY,
        count: 2,
      }, {
        type: ESevenWondersResource.LOOM,
        count: 1,
      }],
    },
    minPlayersCounts: [3, 5],
  },

  // commercial

  {
    id: ESevenWonderCardId.FORUM,
    type: ESevenWondersCardType.COMMERCIAL,
    effects: [{
      type: ISevenWondersEffect.RESOURCES,
      variants: [{
        type: ESevenWondersResource.LOOM,
        count: 1,
      }, {
        type: ESevenWondersResource.GLASS,
        count: 1,
      }, {
        type: ESevenWondersResource.PAPYRUS,
        count: 1,
      }],
    }],
    price: {
      resources: [{
        type: ESevenWondersResource.CLAY,
        count: 2,
      }],
    },
    minPlayersCounts: [3, 6, 7],
  }, {
    id: ESevenWonderCardId.CARAVANSERY,
    type: ESevenWondersCardType.COMMERCIAL,
    effects: [{
      type: ISevenWondersEffect.RESOURCES,
      variants: [{
        type: ESevenWondersResource.CLAY,
        count: 1,
      }, {
        type: ESevenWondersResource.STONE,
        count: 1,
      }, {
        type: ESevenWondersResource.ORE,
        count: 1,
      }, {
        type: ESevenWondersResource.WOOD,
        count: 1,
      }],
    }],
    price: {
      resources: [{
        type: ESevenWondersResource.WOOD,
        count: 2,
      }],
    },
    minPlayersCounts: [3, 5, 6],
  }, {
    id: ESevenWonderCardId.VINEYARD,
    type: ESevenWondersCardType.COMMERCIAL,
    effects: [{
      type: ISevenWondersEffect.CARDS_TYPE,
      directions: [ESevenWondersPlayerDirection.LEFT, ESevenWondersPlayerDirection.SELF, ESevenWondersPlayerDirection.RIGHT],
      sources: [{
        cardTypes: [ESevenWondersCardType.RAW_MATERIAL],
        gain: {
          coins: 1,
        },
      }],
    }],
    minPlayersCounts: [3, 6],
  }, {
    id: ESevenWonderCardId.BAZAR,
    type: ESevenWondersCardType.COMMERCIAL,
    effects: [{
      type: ISevenWondersEffect.CARDS_TYPE,
      directions: [ESevenWondersPlayerDirection.LEFT, ESevenWondersPlayerDirection.SELF, ESevenWondersPlayerDirection.RIGHT],
      sources: [{
        cardTypes: [ESevenWondersCardType.MANUFACTURED_GOODS],
        gain: {
          coins: 2,
        },
      }],
    }],
    minPlayersCounts: [4, 7],
  },

  // military

  {
    id: ESevenWonderCardId.WALLS,
    type: ESevenWondersCardType.MILITARY,
    effects: [{
      type: ISevenWondersEffect.SHIELDS,
      count: 2,
    }],
    price: {
      resources: [{
        type: ESevenWondersResource.STONE,
        count: 3,
      }],
    },
    minPlayersCounts: [3, 7],
  }, {
    id: ESevenWonderCardId.TRAINING_GROUND,
    type: ESevenWondersCardType.MILITARY,
    effects: [{
      type: ISevenWondersEffect.SHIELDS,
      count: 2,
    }],
    price: {
      resources: [{
        type: ESevenWondersResource.WOOD,
        count: 1,
      }, {
        type: ESevenWondersResource.ORE,
        count: 2,
      }],
    },
    minPlayersCounts: [4, 6, 7],
  }, {
    id: ESevenWonderCardId.STABLES,
    type: ESevenWondersCardType.MILITARY,
    effects: [{
      type: ISevenWondersEffect.SHIELDS,
      count: 2,
    }],
    price: {
      resources: [{
        type: ESevenWondersResource.ORE,
        count: 1,
      }, {
        type: ESevenWondersResource.CLAY,
        count: 1,
      }, {
        type: ESevenWondersResource.WOOD,
        count: 1,
      }],
    },
    minPlayersCounts: [3, 5],
  }, {
    id: ESevenWonderCardId.ARCHERY_RANGE,
    type: ESevenWondersCardType.MILITARY,
    effects: [{
      type: ISevenWondersEffect.SHIELDS,
      count: 2,
    }],
    price: {
      resources: [{
        type: ESevenWondersResource.WOOD,
        count: 2,
      }, {
        type: ESevenWondersResource.ORE,
        count: 1,
      }],
    },
    minPlayersCounts: [3, 6],
  },

  // scientific

  {
    id: ESevenWonderCardId.DISPENSARY,
    type: ESevenWondersCardType.SCIENTIFIC,
    effects: [{
      type: ISevenWondersEffect.SCIENTIFIC_SYMBOLS,
      variants: [ESevenWondersScientificSymbol.COMPASS],
    }],
    price: {
      resources: [{
        type: ESevenWondersResource.ORE,
        count: 2,
      }, {
        type: ESevenWondersResource.GLASS,
        count: 1,
      }],
    },
    minPlayersCounts: [3, 4],
  }, {
    id: ESevenWonderCardId.LABORATORY,
    type: ESevenWondersCardType.SCIENTIFIC,
    effects: [{
      type: ISevenWondersEffect.SCIENTIFIC_SYMBOLS,
      variants: [ESevenWondersScientificSymbol.GEAR],
    }],
    price: {
      resources: [{
        type: ESevenWondersResource.CLAY,
        count: 2,
      }, {
        type: ESevenWondersResource.PAPYRUS,
        count: 1,
      }],
    },
    minPlayersCounts: [3, 5],
  }, {
    id: ESevenWonderCardId.LIBRARY,
    type: ESevenWondersCardType.SCIENTIFIC,
    effects: [{
      type: ISevenWondersEffect.SCIENTIFIC_SYMBOLS,
      variants: [ESevenWondersScientificSymbol.TABLET],
    }],
    price: {
      resources: [{
        type: ESevenWondersResource.STONE,
        count: 2,
      }, {
        type: ESevenWondersResource.LOOM,
        count: 1,
      }],
    },
    minPlayersCounts: [3, 6],
  }, {
    id: ESevenWonderCardId.SCHOOL,
    type: ESevenWondersCardType.SCIENTIFIC,
    effects: [{
      type: ISevenWondersEffect.SCIENTIFIC_SYMBOLS,
      variants: [ESevenWondersScientificSymbol.TABLET],
    }],
    price: {
      resources: [{
        type: ESevenWondersResource.WOOD,
        count: 1,
      }, {
        type: ESevenWondersResource.PAPYRUS,
        count: 1,
      }],
    },
    minPlayersCounts: [3, 7],
  }],
];

export default CARDS_BY_AGE;
