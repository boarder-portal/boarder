import { ECardId, ECardType, ICard } from 'common/types/sevenWonders/cards';
import { EEffect } from 'common/types/sevenWonders/effects';
import { ENeighborSide, EPlayerDirection, EResource, EScientificSymbol } from 'common/types/sevenWonders';

const CARDS_BY_AGE: ICard[][] = [
  // age 1
  [
    // manufactured goods
    {
      id: ECardId.LOOM,
      type: ECardType.MANUFACTURED_GOODS,
      effects: [
        {
          type: EEffect.RESOURCES,
          variants: [
            {
              type: EResource.LOOM,
              count: 1,
            },
          ],
        },
      ],
      minPlayersCounts: [3, 6],
    },
    {
      id: ECardId.GLASSWORKS,
      type: ECardType.MANUFACTURED_GOODS,
      effects: [
        {
          type: EEffect.RESOURCES,
          variants: [
            {
              type: EResource.GLASS,
              count: 1,
            },
          ],
        },
      ],
      minPlayersCounts: [3, 6],
    },
    {
      id: ECardId.PRESS,
      type: ECardType.MANUFACTURED_GOODS,
      effects: [
        {
          type: EEffect.RESOURCES,
          variants: [
            {
              type: EResource.PAPYRUS,
              count: 1,
            },
          ],
        },
      ],
      minPlayersCounts: [3, 6],
    },

    // raw materials
    {
      id: ECardId.LUMBER_YARD,
      type: ECardType.RAW_MATERIAL,
      effects: [
        {
          type: EEffect.RESOURCES,
          variants: [
            {
              type: EResource.WOOD,
              count: 1,
            },
          ],
        },
      ],
      minPlayersCounts: [3, 4],
    },
    {
      id: ECardId.STONE_PIT,
      type: ECardType.RAW_MATERIAL,
      effects: [
        {
          type: EEffect.RESOURCES,
          variants: [
            {
              type: EResource.STONE,
              count: 1,
            },
          ],
        },
      ],
      minPlayersCounts: [3, 5],
    },
    {
      id: ECardId.CLAY_POOL,
      type: ECardType.RAW_MATERIAL,
      effects: [
        {
          type: EEffect.RESOURCES,
          variants: [
            {
              type: EResource.CLAY,
              count: 1,
            },
          ],
        },
      ],
      minPlayersCounts: [3, 5],
    },
    {
      id: ECardId.ORE_VEIN,
      type: ECardType.RAW_MATERIAL,
      effects: [
        {
          type: EEffect.RESOURCES,
          variants: [
            {
              type: EResource.ORE,
              count: 1,
            },
          ],
        },
      ],
      minPlayersCounts: [3, 4],
    },
    {
      id: ECardId.TREE_FARM,
      type: ECardType.RAW_MATERIAL,
      effects: [
        {
          type: EEffect.RESOURCES,
          variants: [
            {
              type: EResource.WOOD,
              count: 1,
            },
            {
              type: EResource.CLAY,
              count: 1,
            },
          ],
        },
      ],
      price: {
        coins: 1,
      },
      minPlayersCounts: [6],
    },
    {
      id: ECardId.EXCAVATION,
      type: ECardType.RAW_MATERIAL,
      effects: [
        {
          type: EEffect.RESOURCES,
          variants: [
            {
              type: EResource.STONE,
              count: 1,
            },
            {
              type: EResource.CLAY,
              count: 1,
            },
          ],
        },
      ],
      price: {
        coins: 1,
      },
      minPlayersCounts: [4],
    },
    {
      id: ECardId.CLAY_PIT,
      type: ECardType.RAW_MATERIAL,
      effects: [
        {
          type: EEffect.RESOURCES,
          variants: [
            {
              type: EResource.CLAY,
              count: 1,
            },
            {
              type: EResource.ORE,
              count: 1,
            },
          ],
        },
      ],
      price: {
        coins: 1,
      },
      minPlayersCounts: [3],
    },
    {
      id: ECardId.TIMBER_YARD,
      type: ECardType.RAW_MATERIAL,
      effects: [
        {
          type: EEffect.RESOURCES,
          variants: [
            {
              type: EResource.STONE,
              count: 1,
            },
            {
              type: EResource.WOOD,
              count: 1,
            },
          ],
        },
      ],
      price: {
        coins: 1,
      },
      minPlayersCounts: [3],
    },
    {
      id: ECardId.FOREST_CAVE,
      type: ECardType.RAW_MATERIAL,
      effects: [
        {
          type: EEffect.RESOURCES,
          variants: [
            {
              type: EResource.WOOD,
              count: 1,
            },
            {
              type: EResource.ORE,
              count: 1,
            },
          ],
        },
      ],
      price: {
        coins: 1,
      },
      minPlayersCounts: [5],
    },
    {
      id: ECardId.MINE,
      type: ECardType.RAW_MATERIAL,
      effects: [
        {
          type: EEffect.RESOURCES,
          variants: [
            {
              type: EResource.ORE,
              count: 1,
            },
            {
              type: EResource.STONE,
              count: 1,
            },
          ],
        },
      ],
      price: {
        coins: 1,
      },
      minPlayersCounts: [6],
    },

    // civilian
    {
      id: ECardId.PAWNSHOP,
      type: ECardType.CIVILIAN,
      effects: [
        {
          type: EEffect.GAIN,
          gain: {
            points: 3,
          },
        },
      ],
      minPlayersCounts: [4, 7],
    },
    {
      id: ECardId.BATHS,
      type: ECardType.CIVILIAN,
      effects: [
        {
          type: EEffect.GAIN,
          gain: {
            points: 3,
          },
        },
      ],
      price: {
        resources: [
          {
            type: EResource.STONE,
            count: 1,
          },
        ],
      },
      minPlayersCounts: [3, 7],
    },
    {
      id: ECardId.ALTAR,
      type: ECardType.CIVILIAN,
      effects: [
        {
          type: EEffect.GAIN,
          gain: {
            points: 2,
          },
        },
      ],
      minPlayersCounts: [3, 5],
    },
    {
      id: ECardId.THEATER,
      type: ECardType.CIVILIAN,
      effects: [
        {
          type: EEffect.GAIN,
          gain: {
            points: 2,
          },
        },
      ],
      minPlayersCounts: [3, 6],
    },

    // commercial
    {
      id: ECardId.TAVERN,
      type: ECardType.COMMERCIAL,
      effects: [
        {
          type: EEffect.GAIN,
          gain: {
            coins: 5,
          },
        },
      ],
      minPlayersCounts: [4, 5, 7],
    },
    {
      id: ECardId.EAST_TRADING_POST,
      type: ECardType.COMMERCIAL,
      effects: [
        {
          type: EEffect.TRADE,
          sources: [ENeighborSide.RIGHT],
          price: 1,
          resources: [ECardType.RAW_MATERIAL],
        },
      ],
      minPlayersCounts: [3, 7],
    },
    {
      id: ECardId.WEST_TRADING_POST,
      type: ECardType.COMMERCIAL,
      effects: [
        {
          type: EEffect.TRADE,
          sources: [ENeighborSide.LEFT],
          price: 1,
          resources: [ECardType.RAW_MATERIAL],
        },
      ],
      minPlayersCounts: [3, 7],
    },
    {
      id: ECardId.MARKETPLACE,
      type: ECardType.COMMERCIAL,
      effects: [
        {
          type: EEffect.TRADE,
          sources: [ENeighborSide.LEFT, ENeighborSide.RIGHT],
          price: 1,
          resources: [ECardType.MANUFACTURED_GOODS],
        },
      ],
      minPlayersCounts: [3, 6],
    },

    // military
    {
      id: ECardId.STOCKADE,
      type: ECardType.MILITARY,
      effects: [
        {
          type: EEffect.SHIELDS,
          count: 1,
        },
      ],
      price: {
        resources: [
          {
            type: EResource.WOOD,
            count: 1,
          },
        ],
      },
      minPlayersCounts: [3, 7],
    },
    {
      id: ECardId.BARRACKS,
      type: ECardType.MILITARY,
      effects: [
        {
          type: EEffect.SHIELDS,
          count: 1,
        },
      ],
      price: {
        resources: [
          {
            type: EResource.ORE,
            count: 1,
          },
        ],
      },
      minPlayersCounts: [3, 5],
    },
    {
      id: ECardId.GUARD_TOWER,
      type: ECardType.MILITARY,
      effects: [
        {
          type: EEffect.SHIELDS,
          count: 1,
        },
      ],
      price: {
        resources: [
          {
            type: EResource.CLAY,
            count: 1,
          },
        ],
      },
      minPlayersCounts: [3, 4],
    },

    // scientific
    {
      id: ECardId.APOTHECARY,
      type: ECardType.SCIENTIFIC,
      effects: [
        {
          type: EEffect.SCIENTIFIC_SYMBOLS,
          variants: [EScientificSymbol.COMPASS],
        },
      ],
      price: {
        resources: [
          {
            type: EResource.LOOM,
            count: 1,
          },
        ],
      },
      minPlayersCounts: [3, 5],
    },
    {
      id: ECardId.WORKSHOP,
      type: ECardType.SCIENTIFIC,
      effects: [
        {
          type: EEffect.SCIENTIFIC_SYMBOLS,
          variants: [EScientificSymbol.GEAR],
        },
      ],
      price: {
        resources: [
          {
            type: EResource.GLASS,
            count: 1,
          },
        ],
      },
      minPlayersCounts: [3, 7],
    },
    {
      id: ECardId.SCRIPTORIUM,
      type: ECardType.SCIENTIFIC,
      effects: [
        {
          type: EEffect.SCIENTIFIC_SYMBOLS,
          variants: [EScientificSymbol.TABLET],
        },
      ],
      price: {
        resources: [
          {
            type: EResource.PAPYRUS,
            count: 1,
          },
        ],
      },
      minPlayersCounts: [3, 4],
    },
  ],

  // age 2
  [
    // manufactured goods
    {
      id: ECardId.LOOM,
      type: ECardType.MANUFACTURED_GOODS,
      effects: [
        {
          type: EEffect.RESOURCES,
          variants: [
            {
              type: EResource.LOOM,
              count: 1,
            },
          ],
        },
      ],
      minPlayersCounts: [3, 5],
    },
    {
      id: ECardId.GLASSWORKS,
      type: ECardType.MANUFACTURED_GOODS,
      effects: [
        {
          type: EEffect.RESOURCES,
          variants: [
            {
              type: EResource.GLASS,
              count: 1,
            },
          ],
        },
      ],
      minPlayersCounts: [3, 5],
    },
    {
      id: ECardId.PRESS,
      type: ECardType.MANUFACTURED_GOODS,
      effects: [
        {
          type: EEffect.RESOURCES,
          variants: [
            {
              type: EResource.PAPYRUS,
              count: 1,
            },
          ],
        },
      ],
      minPlayersCounts: [3, 5],
    },

    // raw materials
    {
      id: ECardId.SAWMILL,
      type: ECardType.RAW_MATERIAL,
      effects: [
        {
          type: EEffect.RESOURCES,
          variants: [
            {
              type: EResource.WOOD,
              count: 2,
            },
          ],
        },
      ],
      price: {
        coins: 1,
      },
      minPlayersCounts: [3, 4],
    },
    {
      id: ECardId.QUARRY,
      type: ECardType.RAW_MATERIAL,
      effects: [
        {
          type: EEffect.RESOURCES,
          variants: [
            {
              type: EResource.STONE,
              count: 2,
            },
          ],
        },
      ],
      price: {
        coins: 1,
      },
      minPlayersCounts: [3, 4],
    },
    {
      id: ECardId.BRICKYARD,
      type: ECardType.RAW_MATERIAL,
      effects: [
        {
          type: EEffect.RESOURCES,
          variants: [
            {
              type: EResource.CLAY,
              count: 2,
            },
          ],
        },
      ],
      price: {
        coins: 1,
      },
      minPlayersCounts: [3, 4],
    },
    {
      id: ECardId.FOUNDRY,
      type: ECardType.RAW_MATERIAL,
      effects: [
        {
          type: EEffect.RESOURCES,
          variants: [
            {
              type: EResource.ORE,
              count: 2,
            },
          ],
        },
      ],
      price: {
        coins: 1,
      },
      minPlayersCounts: [3, 4],
    },

    // civilian
    {
      id: ECardId.AQUEDUCT,
      type: ECardType.CIVILIAN,
      effects: [
        {
          type: EEffect.GAIN,
          gain: {
            points: 5,
          },
        },
      ],
      price: {
        resources: [
          {
            type: EResource.STONE,
            count: 3,
          },
        ],
        buildings: [ECardId.BATHS],
      },
      minPlayersCounts: [3, 7],
    },
    {
      id: ECardId.TEMPLE,
      type: ECardType.CIVILIAN,
      effects: [
        {
          type: EEffect.GAIN,
          gain: {
            points: 3,
          },
        },
      ],
      price: {
        resources: [
          {
            type: EResource.WOOD,
            count: 1,
          },
          {
            type: EResource.CLAY,
            count: 1,
          },
          {
            type: EResource.GLASS,
            count: 1,
          },
        ],
        buildings: [ECardId.ALTAR],
      },
      minPlayersCounts: [3, 6],
    },
    {
      id: ECardId.STATUE,
      type: ECardType.CIVILIAN,
      effects: [
        {
          type: EEffect.GAIN,
          gain: {
            points: 4,
          },
        },
      ],
      price: {
        resources: [
          {
            type: EResource.WOOD,
            count: 1,
          },
          {
            type: EResource.ORE,
            count: 2,
          },
        ],
        buildings: [ECardId.THEATER],
      },
      minPlayersCounts: [3, 7],
    },
    {
      id: ECardId.COURTHOUSE,
      type: ECardType.CIVILIAN,
      effects: [
        {
          type: EEffect.GAIN,
          gain: {
            points: 4,
          },
        },
      ],
      price: {
        resources: [
          {
            type: EResource.CLAY,
            count: 2,
          },
          {
            type: EResource.LOOM,
            count: 1,
          },
        ],
        buildings: [ECardId.SCRIPTORIUM],
      },
      minPlayersCounts: [3, 5],
    },

    // commercial
    {
      id: ECardId.FORUM,
      type: ECardType.COMMERCIAL,
      effects: [
        {
          type: EEffect.RESOURCES,
          variants: [
            {
              type: EResource.LOOM,
              count: 1,
            },
            {
              type: EResource.GLASS,
              count: 1,
            },
            {
              type: EResource.PAPYRUS,
              count: 1,
            },
          ],
        },
      ],
      price: {
        resources: [
          {
            type: EResource.CLAY,
            count: 2,
          },
        ],
        buildings: [ECardId.EAST_TRADING_POST, ECardId.WEST_TRADING_POST],
      },
      minPlayersCounts: [3, 6, 7],
    },
    {
      id: ECardId.CARAVANSERY,
      type: ECardType.COMMERCIAL,
      effects: [
        {
          type: EEffect.RESOURCES,
          variants: [
            {
              type: EResource.CLAY,
              count: 1,
            },
            {
              type: EResource.STONE,
              count: 1,
            },
            {
              type: EResource.ORE,
              count: 1,
            },
            {
              type: EResource.WOOD,
              count: 1,
            },
          ],
        },
      ],
      price: {
        resources: [
          {
            type: EResource.WOOD,
            count: 2,
          },
        ],
        buildings: [ECardId.MARKETPLACE],
      },
      minPlayersCounts: [3, 5, 6],
    },
    {
      id: ECardId.VINEYARD,
      type: ECardType.COMMERCIAL,
      effects: [
        {
          type: EEffect.CARDS_TYPE,
          directions: [EPlayerDirection.LEFT, EPlayerDirection.SELF, EPlayerDirection.RIGHT],
          cardTypes: [ECardType.RAW_MATERIAL],
          gain: {
            coins: 1,
          },
        },
      ],
      minPlayersCounts: [3, 6],
    },
    {
      id: ECardId.BAZAR,
      type: ECardType.COMMERCIAL,
      effects: [
        {
          type: EEffect.CARDS_TYPE,
          directions: [EPlayerDirection.LEFT, EPlayerDirection.SELF, EPlayerDirection.RIGHT],
          cardTypes: [ECardType.MANUFACTURED_GOODS],
          gain: {
            coins: 2,
          },
        },
      ],
      minPlayersCounts: [4, 7],
    },

    // military
    {
      id: ECardId.WALLS,
      type: ECardType.MILITARY,
      effects: [
        {
          type: EEffect.SHIELDS,
          count: 2,
        },
      ],
      price: {
        resources: [
          {
            type: EResource.STONE,
            count: 3,
          },
        ],
      },
      minPlayersCounts: [3, 7],
    },
    {
      id: ECardId.TRAINING_GROUND,
      type: ECardType.MILITARY,
      effects: [
        {
          type: EEffect.SHIELDS,
          count: 2,
        },
      ],
      price: {
        resources: [
          {
            type: EResource.WOOD,
            count: 1,
          },
          {
            type: EResource.ORE,
            count: 2,
          },
        ],
      },
      minPlayersCounts: [4, 6, 7],
    },
    {
      id: ECardId.STABLES,
      type: ECardType.MILITARY,
      effects: [
        {
          type: EEffect.SHIELDS,
          count: 2,
        },
      ],
      price: {
        resources: [
          {
            type: EResource.ORE,
            count: 1,
          },
          {
            type: EResource.CLAY,
            count: 1,
          },
          {
            type: EResource.WOOD,
            count: 1,
          },
        ],
        buildings: [ECardId.APOTHECARY],
      },
      minPlayersCounts: [3, 5],
    },
    {
      id: ECardId.ARCHERY_RANGE,
      type: ECardType.MILITARY,
      effects: [
        {
          type: EEffect.SHIELDS,
          count: 2,
        },
      ],
      price: {
        resources: [
          {
            type: EResource.WOOD,
            count: 2,
          },
          {
            type: EResource.ORE,
            count: 1,
          },
        ],
        buildings: [ECardId.WORKSHOP],
      },
      minPlayersCounts: [3, 6],
    },

    // scientific
    {
      id: ECardId.DISPENSARY,
      type: ECardType.SCIENTIFIC,
      effects: [
        {
          type: EEffect.SCIENTIFIC_SYMBOLS,
          variants: [EScientificSymbol.COMPASS],
        },
      ],
      price: {
        resources: [
          {
            type: EResource.ORE,
            count: 2,
          },
          {
            type: EResource.GLASS,
            count: 1,
          },
        ],
        buildings: [ECardId.APOTHECARY],
      },
      minPlayersCounts: [3, 4],
    },
    {
      id: ECardId.LABORATORY,
      type: ECardType.SCIENTIFIC,
      effects: [
        {
          type: EEffect.SCIENTIFIC_SYMBOLS,
          variants: [EScientificSymbol.GEAR],
        },
      ],
      price: {
        resources: [
          {
            type: EResource.CLAY,
            count: 2,
          },
          {
            type: EResource.PAPYRUS,
            count: 1,
          },
        ],
        buildings: [ECardId.WORKSHOP],
      },
      minPlayersCounts: [3, 5],
    },
    {
      id: ECardId.LIBRARY,
      type: ECardType.SCIENTIFIC,
      effects: [
        {
          type: EEffect.SCIENTIFIC_SYMBOLS,
          variants: [EScientificSymbol.TABLET],
        },
      ],
      price: {
        resources: [
          {
            type: EResource.STONE,
            count: 2,
          },
          {
            type: EResource.LOOM,
            count: 1,
          },
        ],
        buildings: [ECardId.SCRIPTORIUM],
      },
      minPlayersCounts: [3, 6],
    },
    {
      id: ECardId.SCHOOL,
      type: ECardType.SCIENTIFIC,
      effects: [
        {
          type: EEffect.SCIENTIFIC_SYMBOLS,
          variants: [EScientificSymbol.TABLET],
        },
      ],
      price: {
        resources: [
          {
            type: EResource.WOOD,
            count: 1,
          },
          {
            type: EResource.PAPYRUS,
            count: 1,
          },
        ],
      },
      minPlayersCounts: [3, 7],
    },
  ],

  // age 3
  [
    // civilian
    {
      id: ECardId.PANTHEON,
      type: ECardType.CIVILIAN,
      effects: [
        {
          type: EEffect.GAIN,
          gain: {
            points: 7,
          },
        },
      ],
      price: {
        resources: [
          {
            type: EResource.CLAY,
            count: 2,
          },
          {
            type: EResource.ORE,
            count: 1,
          },
          {
            type: EResource.PAPYRUS,
            count: 1,
          },
          {
            type: EResource.LOOM,
            count: 1,
          },
          {
            type: EResource.GLASS,
            count: 1,
          },
        ],
        buildings: [ECardId.TEMPLE],
      },
      minPlayersCounts: [3, 6],
    },
    {
      id: ECardId.GARDENS,
      type: ECardType.CIVILIAN,
      effects: [
        {
          type: EEffect.GAIN,
          gain: {
            points: 5,
          },
        },
      ],
      price: {
        resources: [
          {
            type: EResource.WOOD,
            count: 1,
          },
          {
            type: EResource.CLAY,
            count: 2,
          },
        ],
        buildings: [ECardId.STATUE],
      },
      minPlayersCounts: [3, 4],
    },
    {
      id: ECardId.TOWN_HALL,
      type: ECardType.CIVILIAN,
      effects: [
        {
          type: EEffect.GAIN,
          gain: {
            points: 6,
          },
        },
      ],
      price: {
        resources: [
          {
            type: EResource.GLASS,
            count: 1,
          },
          {
            type: EResource.ORE,
            count: 1,
          },
          {
            type: EResource.STONE,
            count: 2,
          },
        ],
      },
      minPlayersCounts: [3, 5, 6],
    },
    {
      id: ECardId.PALACE,
      type: ECardType.CIVILIAN,
      effects: [
        {
          type: EEffect.GAIN,
          gain: {
            points: 8,
          },
        },
      ],
      price: {
        resources: [
          {
            type: EResource.GLASS,
            count: 1,
          },
          {
            type: EResource.PAPYRUS,
            count: 1,
          },
          {
            type: EResource.LOOM,
            count: 1,
          },
          {
            type: EResource.CLAY,
            count: 1,
          },
          {
            type: EResource.WOOD,
            count: 1,
          },
          {
            type: EResource.ORE,
            count: 1,
          },
          {
            type: EResource.STONE,
            count: 1,
          },
        ],
      },
      minPlayersCounts: [3, 7],
    },
    {
      id: ECardId.SENATE,
      type: ECardType.CIVILIAN,
      effects: [
        {
          type: EEffect.GAIN,
          gain: {
            points: 6,
          },
        },
      ],
      price: {
        resources: [
          {
            type: EResource.ORE,
            count: 1,
          },
          {
            type: EResource.STONE,
            count: 1,
          },
          {
            type: EResource.WOOD,
            count: 2,
          },
        ],
        buildings: [ECardId.LIBRARY],
      },
      minPlayersCounts: [3, 5],
    },

    // commercial
    {
      id: ECardId.HAVEN,
      type: ECardType.COMMERCIAL,
      effects: [
        {
          type: EEffect.CARDS_TYPE,
          cardTypes: [ECardType.RAW_MATERIAL],
          gain: {
            points: 1,
            coins: 1,
          },
          directions: [EPlayerDirection.SELF],
        },
      ],
      price: {
        resources: [
          {
            type: EResource.LOOM,
            count: 1,
          },
          {
            type: EResource.ORE,
            count: 1,
          },
          {
            type: EResource.WOOD,
            count: 1,
          },
        ],
        buildings: [ECardId.FORUM],
      },
      minPlayersCounts: [3, 4],
    },
    {
      id: ECardId.LIGHTHOUSE,
      type: ECardType.COMMERCIAL,
      effects: [
        {
          type: EEffect.CARDS_TYPE,
          cardTypes: [ECardType.COMMERCIAL],
          gain: {
            points: 1,
            coins: 1,
          },
          directions: [EPlayerDirection.SELF],
        },
      ],
      price: {
        resources: [
          {
            type: EResource.GLASS,
            count: 1,
          },
          {
            type: EResource.STONE,
            count: 1,
          },
        ],
        buildings: [ECardId.CARAVANSERY],
      },
      minPlayersCounts: [3, 6],
    },
    {
      id: ECardId.CHAMBER_OF_COMMERCE,
      type: ECardType.COMMERCIAL,
      effects: [
        {
          type: EEffect.CARDS_TYPE,
          cardTypes: [ECardType.MANUFACTURED_GOODS],
          gain: {
            points: 2,
            coins: 2,
          },
          directions: [EPlayerDirection.SELF],
        },
      ],
      price: {
        resources: [
          {
            type: EResource.CLAY,
            count: 2,
          },
          {
            type: EResource.PAPYRUS,
            count: 1,
          },
        ],
      },
      minPlayersCounts: [4, 6],
    },
    {
      id: ECardId.ARENA,
      type: ECardType.COMMERCIAL,
      effects: [
        {
          type: EEffect.WONDER_LEVELS,
          gain: {
            points: 1,
            coins: 3,
          },
          directions: [EPlayerDirection.SELF],
        },
      ],
      price: {
        resources: [
          {
            type: EResource.ORE,
            count: 1,
          },
          {
            type: EResource.STONE,
            count: 2,
          },
        ],
        buildings: [ECardId.DISPENSARY],
      },
      minPlayersCounts: [3, 5, 7],
    },

    // military
    {
      id: ECardId.FORTIFICATIONS,
      type: ECardType.MILITARY,
      effects: [
        {
          type: EEffect.SHIELDS,
          count: 3,
        },
      ],
      price: {
        resources: [
          {
            type: EResource.STONE,
            count: 1,
          },
          {
            type: EResource.ORE,
            count: 3,
          },
        ],
        buildings: [ECardId.WALLS],
      },
      minPlayersCounts: [3, 7],
    },
    {
      id: ECardId.CIRCUS,
      type: ECardType.MILITARY,
      effects: [
        {
          type: EEffect.SHIELDS,
          count: 3,
        },
      ],
      price: {
        resources: [
          {
            type: EResource.STONE,
            count: 3,
          },
          {
            type: EResource.ORE,
            count: 1,
          },
        ],
        buildings: [ECardId.TRAINING_GROUND],
      },
      minPlayersCounts: [4, 5, 6],
    },
    {
      id: ECardId.ARSENAL,
      type: ECardType.MILITARY,
      effects: [
        {
          type: EEffect.SHIELDS,
          count: 3,
        },
      ],
      price: {
        resources: [
          {
            type: EResource.ORE,
            count: 1,
          },
          {
            type: EResource.WOOD,
            count: 2,
          },
          {
            type: EResource.LOOM,
            count: 1,
          },
        ],
      },
      minPlayersCounts: [3, 4, 7],
    },
    {
      id: ECardId.SIEGE_WORKSHOP,
      type: ECardType.MILITARY,
      effects: [
        {
          type: EEffect.SHIELDS,
          count: 3,
        },
      ],
      price: {
        resources: [
          {
            type: EResource.WOOD,
            count: 1,
          },
          {
            type: EResource.CLAY,
            count: 3,
          },
        ],
        buildings: [ECardId.LABORATORY],
      },
      minPlayersCounts: [3, 5],
    },

    // scientific
    {
      id: ECardId.LODGE,
      type: ECardType.SCIENTIFIC,
      effects: [
        {
          type: EEffect.SCIENTIFIC_SYMBOLS,
          variants: [EScientificSymbol.COMPASS],
        },
      ],
      price: {
        resources: [
          {
            type: EResource.CLAY,
            count: 2,
          },
          {
            type: EResource.LOOM,
            count: 1,
          },
          {
            type: EResource.PAPYRUS,
            count: 1,
          },
        ],
        buildings: [ECardId.DISPENSARY],
      },
      minPlayersCounts: [3, 6],
    },
    {
      id: ECardId.OBSERVATORY,
      type: ECardType.SCIENTIFIC,
      effects: [
        {
          type: EEffect.SCIENTIFIC_SYMBOLS,
          variants: [EScientificSymbol.GEAR],
        },
      ],
      price: {
        resources: [
          {
            type: EResource.ORE,
            count: 2,
          },
          {
            type: EResource.GLASS,
            count: 1,
          },
          {
            type: EResource.LOOM,
            count: 1,
          },
        ],
        buildings: [ECardId.LABORATORY],
      },
      minPlayersCounts: [3, 7],
    },
    {
      id: ECardId.UNIVERSITY,
      type: ECardType.SCIENTIFIC,
      effects: [
        {
          type: EEffect.SCIENTIFIC_SYMBOLS,
          variants: [EScientificSymbol.TABLET],
        },
      ],
      price: {
        resources: [
          {
            type: EResource.WOOD,
            count: 2,
          },
          {
            type: EResource.PAPYRUS,
            count: 1,
          },
          {
            type: EResource.GLASS,
            count: 1,
          },
        ],
        buildings: [ECardId.LIBRARY],
      },
      minPlayersCounts: [3, 4],
    },
    {
      id: ECardId.ACADEMY,
      type: ECardType.SCIENTIFIC,
      effects: [
        {
          type: EEffect.SCIENTIFIC_SYMBOLS,
          variants: [EScientificSymbol.COMPASS],
        },
      ],
      price: {
        resources: [
          {
            type: EResource.STONE,
            count: 3,
          },
          {
            type: EResource.GLASS,
            count: 1,
          },
        ],
        buildings: [ECardId.SCHOOL],
      },
      minPlayersCounts: [3, 7],
    },
    {
      id: ECardId.STUDY,
      type: ECardType.SCIENTIFIC,
      effects: [
        {
          type: EEffect.SCIENTIFIC_SYMBOLS,
          variants: [EScientificSymbol.GEAR],
        },
      ],
      price: {
        resources: [
          {
            type: EResource.WOOD,
            count: 1,
          },
          {
            type: EResource.PAPYRUS,
            count: 1,
          },
          {
            type: EResource.LOOM,
            count: 1,
          },
        ],
        buildings: [ECardId.SCHOOL],
      },
      minPlayersCounts: [3, 5],
    },

    // guilds
    {
      id: ECardId.WORKERS_GUILD,
      type: ECardType.GUILD,
      effects: [
        {
          type: EEffect.CARDS_TYPE,
          cardTypes: [ECardType.RAW_MATERIAL],
          gain: {
            points: 1,
          },
          directions: [EPlayerDirection.LEFT, EPlayerDirection.RIGHT],
        },
      ],
      price: {
        resources: [
          {
            type: EResource.ORE,
            count: 2,
          },
          {
            type: EResource.CLAY,
            count: 1,
          },
          {
            type: EResource.STONE,
            count: 1,
          },
          {
            type: EResource.WOOD,
            count: 1,
          },
        ],
      },
      minPlayersCounts: [],
    },
    {
      id: ECardId.CRAFTSMENS_GUILD,
      type: ECardType.GUILD,
      effects: [
        {
          type: EEffect.CARDS_TYPE,
          cardTypes: [ECardType.MANUFACTURED_GOODS],
          gain: {
            points: 2,
          },
          directions: [EPlayerDirection.LEFT, EPlayerDirection.RIGHT],
        },
      ],
      price: {
        resources: [
          {
            type: EResource.ORE,
            count: 2,
          },
          {
            type: EResource.STONE,
            count: 2,
          },
        ],
      },
      minPlayersCounts: [],
    },
    {
      id: ECardId.TRADERS_GUILD,
      type: ECardType.GUILD,
      effects: [
        {
          type: EEffect.CARDS_TYPE,
          cardTypes: [ECardType.COMMERCIAL],
          gain: {
            points: 1,
          },
          directions: [EPlayerDirection.LEFT, EPlayerDirection.RIGHT],
        },
      ],
      price: {
        resources: [
          {
            type: EResource.LOOM,
            count: 1,
          },
          {
            type: EResource.PAPYRUS,
            count: 1,
          },
          {
            type: EResource.GLASS,
            count: 1,
          },
        ],
      },
      minPlayersCounts: [],
    },
    {
      id: ECardId.PHILOSOPHERS_GUILD,
      type: ECardType.GUILD,
      effects: [
        {
          type: EEffect.CARDS_TYPE,
          cardTypes: [ECardType.SCIENTIFIC],
          gain: {
            points: 1,
          },
          directions: [EPlayerDirection.LEFT, EPlayerDirection.RIGHT],
        },
      ],
      price: {
        resources: [
          {
            type: EResource.CLAY,
            count: 3,
          },
          {
            type: EResource.LOOM,
            count: 1,
          },
          {
            type: EResource.PAPYRUS,
            count: 1,
          },
        ],
      },
      minPlayersCounts: [],
    },
    {
      id: ECardId.SPIES_GUILD,
      type: ECardType.GUILD,
      effects: [
        {
          type: EEffect.CARDS_TYPE,
          cardTypes: [ECardType.MILITARY],
          gain: {
            points: 1,
          },
          directions: [EPlayerDirection.LEFT, EPlayerDirection.RIGHT],
        },
      ],
      price: {
        resources: [
          {
            type: EResource.CLAY,
            count: 3,
          },
          {
            type: EResource.GLASS,
            count: 1,
          },
        ],
      },
      minPlayersCounts: [],
    },
    {
      id: ECardId.STRATEGISTS_GUILD,
      type: ECardType.GUILD,
      effects: [
        {
          type: EEffect.LOSSES,
          gain: {
            points: 1,
          },
          directions: [EPlayerDirection.LEFT, EPlayerDirection.RIGHT],
        },
      ],
      price: {
        resources: [
          {
            type: EResource.ORE,
            count: 2,
          },
          {
            type: EResource.STONE,
            count: 1,
          },
          {
            type: EResource.LOOM,
            count: 1,
          },
        ],
      },
      minPlayersCounts: [],
    },
    {
      id: ECardId.SHIPOWNERS_GUILD,
      type: ECardType.GUILD,
      effects: [
        {
          type: EEffect.CARDS_TYPE,
          cardTypes: [ECardType.RAW_MATERIAL],
          gain: {
            points: 1,
          },
          directions: [EPlayerDirection.SELF],
        },
        {
          type: EEffect.CARDS_TYPE,
          cardTypes: [ECardType.MANUFACTURED_GOODS],
          gain: {
            points: 1,
          },
          directions: [EPlayerDirection.SELF],
        },
        {
          type: EEffect.CARDS_TYPE,
          cardTypes: [ECardType.GUILD],
          gain: {
            points: 1,
          },
          directions: [EPlayerDirection.SELF],
        },
      ],
      price: {
        resources: [
          {
            type: EResource.WOOD,
            count: 3,
          },
          {
            type: EResource.PAPYRUS,
            count: 1,
          },
          {
            type: EResource.GLASS,
            count: 1,
          },
        ],
      },
      minPlayersCounts: [],
    },
    {
      id: ECardId.SCIENTISTS_GUILD,
      type: ECardType.GUILD,
      effects: [
        {
          type: EEffect.SCIENTIFIC_SYMBOLS,
          variants: [EScientificSymbol.GEAR, EScientificSymbol.COMPASS, EScientificSymbol.TABLET],
        },
      ],
      price: {
        resources: [
          {
            type: EResource.WOOD,
            count: 2,
          },
          {
            type: EResource.ORE,
            count: 2,
          },
          {
            type: EResource.PAPYRUS,
            count: 1,
          },
        ],
      },
      minPlayersCounts: [],
    },
    {
      id: ECardId.MAGISTRATES_GUILD,
      type: ECardType.GUILD,
      effects: [
        {
          type: EEffect.CARDS_TYPE,
          cardTypes: [ECardType.CIVILIAN],
          gain: {
            points: 1,
          },
          directions: [EPlayerDirection.LEFT, EPlayerDirection.RIGHT],
        },
      ],
      price: {
        resources: [
          {
            type: EResource.WOOD,
            count: 3,
          },
          {
            type: EResource.STONE,
            count: 1,
          },
          {
            type: EResource.LOOM,
            count: 1,
          },
        ],
      },
      minPlayersCounts: [],
    },
    {
      id: ECardId.BUILDERS_GUILD,
      type: ECardType.GUILD,
      effects: [
        {
          type: EEffect.WONDER_LEVELS,
          gain: {
            points: 1,
          },
          directions: [EPlayerDirection.SELF, EPlayerDirection.LEFT, EPlayerDirection.RIGHT],
        },
      ],
      price: {
        resources: [
          {
            type: EResource.STONE,
            count: 2,
          },
          {
            type: EResource.CLAY,
            count: 2,
          },
          {
            type: EResource.GLASS,
            count: 1,
          },
        ],
      },
      minPlayersCounts: [],
    },
    {
      id: ECardId.GAMERS_GUILD,
      type: ECardType.GUILD,
      effects: [
        {
          type: EEffect.GAIN_BY_COINS,
          gain: {
            points: 1,
          },
          count: 3,
        },
      ],
      price: {
        resources: [
          {
            type: EResource.STONE,
            count: 1,
          },
          {
            type: EResource.CLAY,
            count: 1,
          },
          {
            type: EResource.WOOD,
            count: 1,
          },
          {
            type: EResource.ORE,
            count: 1,
          },
        ],
      },
      minPlayersCounts: [],
    },
    {
      id: ECardId.COURTESANS_GUILD,
      type: ECardType.GUILD,
      effects: [
        {
          type: EEffect.COPY_CARD,
          neighbors: [ENeighborSide.LEFT, ENeighborSide.RIGHT],
          cardType: ECardType.LEADER,
        },
      ],
      price: {
        resources: [
          {
            type: EResource.WOOD,
            count: 1,
          },
          {
            type: EResource.CLAY,
            count: 1,
          },
          {
            type: EResource.GLASS,
            count: 1,
          },
          {
            type: EResource.LOOM,
            count: 1,
          },
        ],
      },
      minPlayersCounts: [],
    },
    {
      id: ECardId.DIPLOMATS_GUILD,
      type: ECardType.GUILD,
      effects: [
        {
          type: EEffect.CARDS_TYPE,
          cardTypes: [ECardType.LEADER],
          gain: {
            points: 1,
          },
          directions: [EPlayerDirection.LEFT, EPlayerDirection.RIGHT],
        },
      ],
      price: {
        resources: [
          {
            type: EResource.STONE,
            count: 1,
          },
          {
            type: EResource.WOOD,
            count: 1,
          },
          {
            type: EResource.GLASS,
            count: 1,
          },
          {
            type: EResource.PAPYRUS,
            count: 1,
          },
        ],
      },
      minPlayersCounts: [],
    },
    {
      id: ECardId.ARCHITECTS_GUILD,
      type: ECardType.GUILD,
      effects: [
        {
          type: EEffect.CARDS_TYPE,
          cardTypes: [ECardType.GUILD],
          gain: {
            points: 3,
          },
          directions: [EPlayerDirection.LEFT, EPlayerDirection.RIGHT],
        },
      ],
      price: {
        resources: [
          {
            type: EResource.ORE,
            count: 3,
          },
          {
            type: EResource.CLAY,
            count: 1,
          },
          {
            type: EResource.PAPYRUS,
            count: 1,
          },
          {
            type: EResource.LOOM,
            count: 1,
          },
        ],
      },
      minPlayersCounts: [],
    },
  ],
];

export default CARDS_BY_AGE;
