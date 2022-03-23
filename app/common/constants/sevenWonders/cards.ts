import { ESevenWonderCardId, ESevenWondersCardType, ISevenWondersCard } from 'common/types/sevenWonders/cards';
import { ISevenWondersEffect } from 'common/types/sevenWonders/effects';
import { ESevenWondersNeighborSide, ESevenWondersResource, ESevenWondersScientificSymbol } from 'common/types/sevenWonders';

const CARDS_BY_AGE: ISevenWondersCard[][] = [
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
  },

  ],
];

export default CARDS_BY_AGE;
