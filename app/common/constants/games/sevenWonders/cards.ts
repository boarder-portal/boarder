import { NeighborSide, PlayerDirection, ResourceType, ScientificSymbolType } from 'common/types/sevenWonders';
import { Card, CardId, CardType } from 'common/types/sevenWonders/cards';
import { EffectType } from 'common/types/sevenWonders/effects';

const CARDS_BY_AGE: Card[][] = [
  // age 1
  [
    // manufactured goods
    {
      id: CardId.LOOM,
      type: CardType.MANUFACTURED_GOODS,
      effects: [
        {
          type: EffectType.RESOURCES,
          variants: [
            {
              type: ResourceType.LOOM,
              count: 1,
            },
          ],
        },
      ],
      minPlayersCounts: [3, 6],
    },
    {
      id: CardId.GLASSWORKS,
      type: CardType.MANUFACTURED_GOODS,
      effects: [
        {
          type: EffectType.RESOURCES,
          variants: [
            {
              type: ResourceType.GLASS,
              count: 1,
            },
          ],
        },
      ],
      minPlayersCounts: [3, 6],
    },
    {
      id: CardId.PRESS,
      type: CardType.MANUFACTURED_GOODS,
      effects: [
        {
          type: EffectType.RESOURCES,
          variants: [
            {
              type: ResourceType.PAPYRUS,
              count: 1,
            },
          ],
        },
      ],
      minPlayersCounts: [3, 6],
    },

    // raw materials
    {
      id: CardId.LUMBER_YARD,
      type: CardType.RAW_MATERIAL,
      effects: [
        {
          type: EffectType.RESOURCES,
          variants: [
            {
              type: ResourceType.WOOD,
              count: 1,
            },
          ],
        },
      ],
      minPlayersCounts: [3, 4],
    },
    {
      id: CardId.STONE_PIT,
      type: CardType.RAW_MATERIAL,
      effects: [
        {
          type: EffectType.RESOURCES,
          variants: [
            {
              type: ResourceType.STONE,
              count: 1,
            },
          ],
        },
      ],
      minPlayersCounts: [3, 5],
    },
    {
      id: CardId.CLAY_POOL,
      type: CardType.RAW_MATERIAL,
      effects: [
        {
          type: EffectType.RESOURCES,
          variants: [
            {
              type: ResourceType.CLAY,
              count: 1,
            },
          ],
        },
      ],
      minPlayersCounts: [3, 5],
    },
    {
      id: CardId.ORE_VEIN,
      type: CardType.RAW_MATERIAL,
      effects: [
        {
          type: EffectType.RESOURCES,
          variants: [
            {
              type: ResourceType.ORE,
              count: 1,
            },
          ],
        },
      ],
      minPlayersCounts: [3, 4],
    },
    {
      id: CardId.TREE_FARM,
      type: CardType.RAW_MATERIAL,
      effects: [
        {
          type: EffectType.RESOURCES,
          variants: [
            {
              type: ResourceType.WOOD,
              count: 1,
            },
            {
              type: ResourceType.CLAY,
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
      id: CardId.EXCAVATION,
      type: CardType.RAW_MATERIAL,
      effects: [
        {
          type: EffectType.RESOURCES,
          variants: [
            {
              type: ResourceType.STONE,
              count: 1,
            },
            {
              type: ResourceType.CLAY,
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
      id: CardId.CLAY_PIT,
      type: CardType.RAW_MATERIAL,
      effects: [
        {
          type: EffectType.RESOURCES,
          variants: [
            {
              type: ResourceType.CLAY,
              count: 1,
            },
            {
              type: ResourceType.ORE,
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
      id: CardId.TIMBER_YARD,
      type: CardType.RAW_MATERIAL,
      effects: [
        {
          type: EffectType.RESOURCES,
          variants: [
            {
              type: ResourceType.STONE,
              count: 1,
            },
            {
              type: ResourceType.WOOD,
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
      id: CardId.FOREST_CAVE,
      type: CardType.RAW_MATERIAL,
      effects: [
        {
          type: EffectType.RESOURCES,
          variants: [
            {
              type: ResourceType.WOOD,
              count: 1,
            },
            {
              type: ResourceType.ORE,
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
      id: CardId.MINE,
      type: CardType.RAW_MATERIAL,
      effects: [
        {
          type: EffectType.RESOURCES,
          variants: [
            {
              type: ResourceType.ORE,
              count: 1,
            },
            {
              type: ResourceType.STONE,
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
      id: CardId.PAWNSHOP,
      type: CardType.CIVILIAN,
      effects: [
        {
          type: EffectType.GAIN,
          gain: {
            points: 3,
          },
        },
      ],
      minPlayersCounts: [4, 7],
    },
    {
      id: CardId.BATHS,
      type: CardType.CIVILIAN,
      effects: [
        {
          type: EffectType.GAIN,
          gain: {
            points: 3,
          },
        },
      ],
      price: {
        resources: [
          {
            type: ResourceType.STONE,
            count: 1,
          },
        ],
      },
      minPlayersCounts: [3, 7],
    },
    {
      id: CardId.ALTAR,
      type: CardType.CIVILIAN,
      effects: [
        {
          type: EffectType.GAIN,
          gain: {
            points: 2,
          },
        },
      ],
      minPlayersCounts: [3, 5],
    },
    {
      id: CardId.THEATER,
      type: CardType.CIVILIAN,
      effects: [
        {
          type: EffectType.GAIN,
          gain: {
            points: 2,
          },
        },
      ],
      minPlayersCounts: [3, 6],
    },

    // commercial
    {
      id: CardId.TAVERN,
      type: CardType.COMMERCIAL,
      effects: [
        {
          type: EffectType.GAIN,
          gain: {
            coins: 5,
          },
        },
      ],
      minPlayersCounts: [4, 5, 7],
    },
    {
      id: CardId.EAST_TRADING_POST,
      type: CardType.COMMERCIAL,
      effects: [
        {
          type: EffectType.TRADE,
          sources: [NeighborSide.RIGHT],
          price: 1,
          resources: [CardType.RAW_MATERIAL],
        },
      ],
      minPlayersCounts: [3, 7],
    },
    {
      id: CardId.WEST_TRADING_POST,
      type: CardType.COMMERCIAL,
      effects: [
        {
          type: EffectType.TRADE,
          sources: [NeighborSide.LEFT],
          price: 1,
          resources: [CardType.RAW_MATERIAL],
        },
      ],
      minPlayersCounts: [3, 7],
    },
    {
      id: CardId.MARKETPLACE,
      type: CardType.COMMERCIAL,
      effects: [
        {
          type: EffectType.TRADE,
          sources: [NeighborSide.LEFT, NeighborSide.RIGHT],
          price: 1,
          resources: [CardType.MANUFACTURED_GOODS],
        },
      ],
      minPlayersCounts: [3, 6],
    },

    // military
    {
      id: CardId.STOCKADE,
      type: CardType.MILITARY,
      effects: [
        {
          type: EffectType.SHIELDS,
          count: 1,
        },
      ],
      price: {
        resources: [
          {
            type: ResourceType.WOOD,
            count: 1,
          },
        ],
      },
      minPlayersCounts: [3, 7],
    },
    {
      id: CardId.BARRACKS,
      type: CardType.MILITARY,
      effects: [
        {
          type: EffectType.SHIELDS,
          count: 1,
        },
      ],
      price: {
        resources: [
          {
            type: ResourceType.ORE,
            count: 1,
          },
        ],
      },
      minPlayersCounts: [3, 5],
    },
    {
      id: CardId.GUARD_TOWER,
      type: CardType.MILITARY,
      effects: [
        {
          type: EffectType.SHIELDS,
          count: 1,
        },
      ],
      price: {
        resources: [
          {
            type: ResourceType.CLAY,
            count: 1,
          },
        ],
      },
      minPlayersCounts: [3, 4],
    },

    // scientific
    {
      id: CardId.APOTHECARY,
      type: CardType.SCIENTIFIC,
      effects: [
        {
          type: EffectType.SCIENTIFIC_SYMBOLS,
          variants: [ScientificSymbolType.COMPASS],
        },
      ],
      price: {
        resources: [
          {
            type: ResourceType.LOOM,
            count: 1,
          },
        ],
      },
      minPlayersCounts: [3, 5],
    },
    {
      id: CardId.WORKSHOP,
      type: CardType.SCIENTIFIC,
      effects: [
        {
          type: EffectType.SCIENTIFIC_SYMBOLS,
          variants: [ScientificSymbolType.GEAR],
        },
      ],
      price: {
        resources: [
          {
            type: ResourceType.GLASS,
            count: 1,
          },
        ],
      },
      minPlayersCounts: [3, 7],
    },
    {
      id: CardId.SCRIPTORIUM,
      type: CardType.SCIENTIFIC,
      effects: [
        {
          type: EffectType.SCIENTIFIC_SYMBOLS,
          variants: [ScientificSymbolType.TABLET],
        },
      ],
      price: {
        resources: [
          {
            type: ResourceType.PAPYRUS,
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
      id: CardId.LOOM,
      type: CardType.MANUFACTURED_GOODS,
      effects: [
        {
          type: EffectType.RESOURCES,
          variants: [
            {
              type: ResourceType.LOOM,
              count: 1,
            },
          ],
        },
      ],
      minPlayersCounts: [3, 5],
    },
    {
      id: CardId.GLASSWORKS,
      type: CardType.MANUFACTURED_GOODS,
      effects: [
        {
          type: EffectType.RESOURCES,
          variants: [
            {
              type: ResourceType.GLASS,
              count: 1,
            },
          ],
        },
      ],
      minPlayersCounts: [3, 5],
    },
    {
      id: CardId.PRESS,
      type: CardType.MANUFACTURED_GOODS,
      effects: [
        {
          type: EffectType.RESOURCES,
          variants: [
            {
              type: ResourceType.PAPYRUS,
              count: 1,
            },
          ],
        },
      ],
      minPlayersCounts: [3, 5],
    },

    // raw materials
    {
      id: CardId.SAWMILL,
      type: CardType.RAW_MATERIAL,
      effects: [
        {
          type: EffectType.RESOURCES,
          variants: [
            {
              type: ResourceType.WOOD,
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
      id: CardId.QUARRY,
      type: CardType.RAW_MATERIAL,
      effects: [
        {
          type: EffectType.RESOURCES,
          variants: [
            {
              type: ResourceType.STONE,
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
      id: CardId.BRICKYARD,
      type: CardType.RAW_MATERIAL,
      effects: [
        {
          type: EffectType.RESOURCES,
          variants: [
            {
              type: ResourceType.CLAY,
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
      id: CardId.FOUNDRY,
      type: CardType.RAW_MATERIAL,
      effects: [
        {
          type: EffectType.RESOURCES,
          variants: [
            {
              type: ResourceType.ORE,
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
      id: CardId.AQUEDUCT,
      type: CardType.CIVILIAN,
      effects: [
        {
          type: EffectType.GAIN,
          gain: {
            points: 5,
          },
        },
      ],
      price: {
        resources: [
          {
            type: ResourceType.STONE,
            count: 3,
          },
        ],
        buildings: [CardId.BATHS],
      },
      minPlayersCounts: [3, 7],
    },
    {
      id: CardId.TEMPLE,
      type: CardType.CIVILIAN,
      effects: [
        {
          type: EffectType.GAIN,
          gain: {
            points: 3,
          },
        },
      ],
      price: {
        resources: [
          {
            type: ResourceType.WOOD,
            count: 1,
          },
          {
            type: ResourceType.CLAY,
            count: 1,
          },
          {
            type: ResourceType.GLASS,
            count: 1,
          },
        ],
        buildings: [CardId.ALTAR],
      },
      minPlayersCounts: [3, 6],
    },
    {
      id: CardId.STATUE,
      type: CardType.CIVILIAN,
      effects: [
        {
          type: EffectType.GAIN,
          gain: {
            points: 4,
          },
        },
      ],
      price: {
        resources: [
          {
            type: ResourceType.WOOD,
            count: 1,
          },
          {
            type: ResourceType.ORE,
            count: 2,
          },
        ],
        buildings: [CardId.THEATER],
      },
      minPlayersCounts: [3, 7],
    },
    {
      id: CardId.COURTHOUSE,
      type: CardType.CIVILIAN,
      effects: [
        {
          type: EffectType.GAIN,
          gain: {
            points: 4,
          },
        },
      ],
      price: {
        resources: [
          {
            type: ResourceType.CLAY,
            count: 2,
          },
          {
            type: ResourceType.LOOM,
            count: 1,
          },
        ],
        buildings: [CardId.SCRIPTORIUM],
      },
      minPlayersCounts: [3, 5],
    },

    // commercial
    {
      id: CardId.FORUM,
      type: CardType.COMMERCIAL,
      effects: [
        {
          type: EffectType.RESOURCES,
          variants: [
            {
              type: ResourceType.LOOM,
              count: 1,
            },
            {
              type: ResourceType.GLASS,
              count: 1,
            },
            {
              type: ResourceType.PAPYRUS,
              count: 1,
            },
          ],
        },
      ],
      price: {
        resources: [
          {
            type: ResourceType.CLAY,
            count: 2,
          },
        ],
        buildings: [CardId.EAST_TRADING_POST, CardId.WEST_TRADING_POST],
      },
      minPlayersCounts: [3, 6, 7],
    },
    {
      id: CardId.CARAVANSERY,
      type: CardType.COMMERCIAL,
      effects: [
        {
          type: EffectType.RESOURCES,
          variants: [
            {
              type: ResourceType.CLAY,
              count: 1,
            },
            {
              type: ResourceType.STONE,
              count: 1,
            },
            {
              type: ResourceType.ORE,
              count: 1,
            },
            {
              type: ResourceType.WOOD,
              count: 1,
            },
          ],
        },
      ],
      price: {
        resources: [
          {
            type: ResourceType.WOOD,
            count: 2,
          },
        ],
        buildings: [CardId.MARKETPLACE],
      },
      minPlayersCounts: [3, 5, 6],
    },
    {
      id: CardId.VINEYARD,
      type: CardType.COMMERCIAL,
      effects: [
        {
          type: EffectType.CARDS_TYPE,
          directions: [PlayerDirection.LEFT, PlayerDirection.SELF, PlayerDirection.RIGHT],
          cardTypes: [CardType.RAW_MATERIAL],
          gain: {
            coins: 1,
          },
        },
      ],
      minPlayersCounts: [3, 6],
    },
    {
      id: CardId.BAZAR,
      type: CardType.COMMERCIAL,
      effects: [
        {
          type: EffectType.CARDS_TYPE,
          directions: [PlayerDirection.LEFT, PlayerDirection.SELF, PlayerDirection.RIGHT],
          cardTypes: [CardType.MANUFACTURED_GOODS],
          gain: {
            coins: 2,
          },
        },
      ],
      minPlayersCounts: [4, 7],
    },

    // military
    {
      id: CardId.WALLS,
      type: CardType.MILITARY,
      effects: [
        {
          type: EffectType.SHIELDS,
          count: 2,
        },
      ],
      price: {
        resources: [
          {
            type: ResourceType.STONE,
            count: 3,
          },
        ],
      },
      minPlayersCounts: [3, 7],
    },
    {
      id: CardId.TRAINING_GROUND,
      type: CardType.MILITARY,
      effects: [
        {
          type: EffectType.SHIELDS,
          count: 2,
        },
      ],
      price: {
        resources: [
          {
            type: ResourceType.WOOD,
            count: 1,
          },
          {
            type: ResourceType.ORE,
            count: 2,
          },
        ],
      },
      minPlayersCounts: [4, 6, 7],
    },
    {
      id: CardId.STABLES,
      type: CardType.MILITARY,
      effects: [
        {
          type: EffectType.SHIELDS,
          count: 2,
        },
      ],
      price: {
        resources: [
          {
            type: ResourceType.ORE,
            count: 1,
          },
          {
            type: ResourceType.CLAY,
            count: 1,
          },
          {
            type: ResourceType.WOOD,
            count: 1,
          },
        ],
        buildings: [CardId.APOTHECARY],
      },
      minPlayersCounts: [3, 5],
    },
    {
      id: CardId.ARCHERY_RANGE,
      type: CardType.MILITARY,
      effects: [
        {
          type: EffectType.SHIELDS,
          count: 2,
        },
      ],
      price: {
        resources: [
          {
            type: ResourceType.WOOD,
            count: 2,
          },
          {
            type: ResourceType.ORE,
            count: 1,
          },
        ],
        buildings: [CardId.WORKSHOP],
      },
      minPlayersCounts: [3, 6],
    },

    // scientific
    {
      id: CardId.DISPENSARY,
      type: CardType.SCIENTIFIC,
      effects: [
        {
          type: EffectType.SCIENTIFIC_SYMBOLS,
          variants: [ScientificSymbolType.COMPASS],
        },
      ],
      price: {
        resources: [
          {
            type: ResourceType.ORE,
            count: 2,
          },
          {
            type: ResourceType.GLASS,
            count: 1,
          },
        ],
        buildings: [CardId.APOTHECARY],
      },
      minPlayersCounts: [3, 4],
    },
    {
      id: CardId.LABORATORY,
      type: CardType.SCIENTIFIC,
      effects: [
        {
          type: EffectType.SCIENTIFIC_SYMBOLS,
          variants: [ScientificSymbolType.GEAR],
        },
      ],
      price: {
        resources: [
          {
            type: ResourceType.CLAY,
            count: 2,
          },
          {
            type: ResourceType.PAPYRUS,
            count: 1,
          },
        ],
        buildings: [CardId.WORKSHOP],
      },
      minPlayersCounts: [3, 5],
    },
    {
      id: CardId.LIBRARY,
      type: CardType.SCIENTIFIC,
      effects: [
        {
          type: EffectType.SCIENTIFIC_SYMBOLS,
          variants: [ScientificSymbolType.TABLET],
        },
      ],
      price: {
        resources: [
          {
            type: ResourceType.STONE,
            count: 2,
          },
          {
            type: ResourceType.LOOM,
            count: 1,
          },
        ],
        buildings: [CardId.SCRIPTORIUM],
      },
      minPlayersCounts: [3, 6],
    },
    {
      id: CardId.SCHOOL,
      type: CardType.SCIENTIFIC,
      effects: [
        {
          type: EffectType.SCIENTIFIC_SYMBOLS,
          variants: [ScientificSymbolType.TABLET],
        },
      ],
      price: {
        resources: [
          {
            type: ResourceType.WOOD,
            count: 1,
          },
          {
            type: ResourceType.PAPYRUS,
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
      id: CardId.PANTHEON,
      type: CardType.CIVILIAN,
      effects: [
        {
          type: EffectType.GAIN,
          gain: {
            points: 7,
          },
        },
      ],
      price: {
        resources: [
          {
            type: ResourceType.CLAY,
            count: 2,
          },
          {
            type: ResourceType.ORE,
            count: 1,
          },
          {
            type: ResourceType.PAPYRUS,
            count: 1,
          },
          {
            type: ResourceType.LOOM,
            count: 1,
          },
          {
            type: ResourceType.GLASS,
            count: 1,
          },
        ],
        buildings: [CardId.TEMPLE],
      },
      minPlayersCounts: [3, 6],
    },
    {
      id: CardId.GARDENS,
      type: CardType.CIVILIAN,
      effects: [
        {
          type: EffectType.GAIN,
          gain: {
            points: 5,
          },
        },
      ],
      price: {
        resources: [
          {
            type: ResourceType.WOOD,
            count: 1,
          },
          {
            type: ResourceType.CLAY,
            count: 2,
          },
        ],
        buildings: [CardId.STATUE],
      },
      minPlayersCounts: [3, 4],
    },
    {
      id: CardId.TOWN_HALL,
      type: CardType.CIVILIAN,
      effects: [
        {
          type: EffectType.GAIN,
          gain: {
            points: 6,
          },
        },
      ],
      price: {
        resources: [
          {
            type: ResourceType.GLASS,
            count: 1,
          },
          {
            type: ResourceType.ORE,
            count: 1,
          },
          {
            type: ResourceType.STONE,
            count: 2,
          },
        ],
      },
      minPlayersCounts: [3, 5, 6],
    },
    {
      id: CardId.PALACE,
      type: CardType.CIVILIAN,
      effects: [
        {
          type: EffectType.GAIN,
          gain: {
            points: 8,
          },
        },
      ],
      price: {
        resources: [
          {
            type: ResourceType.GLASS,
            count: 1,
          },
          {
            type: ResourceType.PAPYRUS,
            count: 1,
          },
          {
            type: ResourceType.LOOM,
            count: 1,
          },
          {
            type: ResourceType.CLAY,
            count: 1,
          },
          {
            type: ResourceType.WOOD,
            count: 1,
          },
          {
            type: ResourceType.ORE,
            count: 1,
          },
          {
            type: ResourceType.STONE,
            count: 1,
          },
        ],
      },
      minPlayersCounts: [3, 7],
    },
    {
      id: CardId.SENATE,
      type: CardType.CIVILIAN,
      effects: [
        {
          type: EffectType.GAIN,
          gain: {
            points: 6,
          },
        },
      ],
      price: {
        resources: [
          {
            type: ResourceType.ORE,
            count: 1,
          },
          {
            type: ResourceType.STONE,
            count: 1,
          },
          {
            type: ResourceType.WOOD,
            count: 2,
          },
        ],
        buildings: [CardId.LIBRARY],
      },
      minPlayersCounts: [3, 5],
    },

    // commercial
    {
      id: CardId.HAVEN,
      type: CardType.COMMERCIAL,
      effects: [
        {
          type: EffectType.CARDS_TYPE,
          cardTypes: [CardType.RAW_MATERIAL],
          gain: {
            points: 1,
            coins: 1,
          },
          directions: [PlayerDirection.SELF],
        },
      ],
      price: {
        resources: [
          {
            type: ResourceType.LOOM,
            count: 1,
          },
          {
            type: ResourceType.ORE,
            count: 1,
          },
          {
            type: ResourceType.WOOD,
            count: 1,
          },
        ],
        buildings: [CardId.FORUM],
      },
      minPlayersCounts: [3, 4],
    },
    {
      id: CardId.LIGHTHOUSE,
      type: CardType.COMMERCIAL,
      effects: [
        {
          type: EffectType.CARDS_TYPE,
          cardTypes: [CardType.COMMERCIAL],
          gain: {
            points: 1,
            coins: 1,
          },
          directions: [PlayerDirection.SELF],
        },
      ],
      price: {
        resources: [
          {
            type: ResourceType.GLASS,
            count: 1,
          },
          {
            type: ResourceType.STONE,
            count: 1,
          },
        ],
        buildings: [CardId.CARAVANSERY],
      },
      minPlayersCounts: [3, 6],
    },
    {
      id: CardId.CHAMBER_OF_COMMERCE,
      type: CardType.COMMERCIAL,
      effects: [
        {
          type: EffectType.CARDS_TYPE,
          cardTypes: [CardType.MANUFACTURED_GOODS],
          gain: {
            points: 2,
            coins: 2,
          },
          directions: [PlayerDirection.SELF],
        },
      ],
      price: {
        resources: [
          {
            type: ResourceType.CLAY,
            count: 2,
          },
          {
            type: ResourceType.PAPYRUS,
            count: 1,
          },
        ],
      },
      minPlayersCounts: [4, 6],
    },
    {
      id: CardId.ARENA,
      type: CardType.COMMERCIAL,
      effects: [
        {
          type: EffectType.WONDER_LEVELS,
          gain: {
            points: 1,
            coins: 3,
          },
          directions: [PlayerDirection.SELF],
        },
      ],
      price: {
        resources: [
          {
            type: ResourceType.ORE,
            count: 1,
          },
          {
            type: ResourceType.STONE,
            count: 2,
          },
        ],
        buildings: [CardId.DISPENSARY],
      },
      minPlayersCounts: [3, 5, 7],
    },

    // military
    {
      id: CardId.FORTIFICATIONS,
      type: CardType.MILITARY,
      effects: [
        {
          type: EffectType.SHIELDS,
          count: 3,
        },
      ],
      price: {
        resources: [
          {
            type: ResourceType.STONE,
            count: 1,
          },
          {
            type: ResourceType.ORE,
            count: 3,
          },
        ],
        buildings: [CardId.WALLS],
      },
      minPlayersCounts: [3, 7],
    },
    {
      id: CardId.CIRCUS,
      type: CardType.MILITARY,
      effects: [
        {
          type: EffectType.SHIELDS,
          count: 3,
        },
      ],
      price: {
        resources: [
          {
            type: ResourceType.STONE,
            count: 3,
          },
          {
            type: ResourceType.ORE,
            count: 1,
          },
        ],
        buildings: [CardId.TRAINING_GROUND],
      },
      minPlayersCounts: [4, 5, 6],
    },
    {
      id: CardId.ARSENAL,
      type: CardType.MILITARY,
      effects: [
        {
          type: EffectType.SHIELDS,
          count: 3,
        },
      ],
      price: {
        resources: [
          {
            type: ResourceType.ORE,
            count: 1,
          },
          {
            type: ResourceType.WOOD,
            count: 2,
          },
          {
            type: ResourceType.LOOM,
            count: 1,
          },
        ],
      },
      minPlayersCounts: [3, 4, 7],
    },
    {
      id: CardId.SIEGE_WORKSHOP,
      type: CardType.MILITARY,
      effects: [
        {
          type: EffectType.SHIELDS,
          count: 3,
        },
      ],
      price: {
        resources: [
          {
            type: ResourceType.WOOD,
            count: 1,
          },
          {
            type: ResourceType.CLAY,
            count: 3,
          },
        ],
        buildings: [CardId.LABORATORY],
      },
      minPlayersCounts: [3, 5],
    },

    // scientific
    {
      id: CardId.LODGE,
      type: CardType.SCIENTIFIC,
      effects: [
        {
          type: EffectType.SCIENTIFIC_SYMBOLS,
          variants: [ScientificSymbolType.COMPASS],
        },
      ],
      price: {
        resources: [
          {
            type: ResourceType.CLAY,
            count: 2,
          },
          {
            type: ResourceType.LOOM,
            count: 1,
          },
          {
            type: ResourceType.PAPYRUS,
            count: 1,
          },
        ],
        buildings: [CardId.DISPENSARY],
      },
      minPlayersCounts: [3, 6],
    },
    {
      id: CardId.OBSERVATORY,
      type: CardType.SCIENTIFIC,
      effects: [
        {
          type: EffectType.SCIENTIFIC_SYMBOLS,
          variants: [ScientificSymbolType.GEAR],
        },
      ],
      price: {
        resources: [
          {
            type: ResourceType.ORE,
            count: 2,
          },
          {
            type: ResourceType.GLASS,
            count: 1,
          },
          {
            type: ResourceType.LOOM,
            count: 1,
          },
        ],
        buildings: [CardId.LABORATORY],
      },
      minPlayersCounts: [3, 7],
    },
    {
      id: CardId.UNIVERSITY,
      type: CardType.SCIENTIFIC,
      effects: [
        {
          type: EffectType.SCIENTIFIC_SYMBOLS,
          variants: [ScientificSymbolType.TABLET],
        },
      ],
      price: {
        resources: [
          {
            type: ResourceType.WOOD,
            count: 2,
          },
          {
            type: ResourceType.PAPYRUS,
            count: 1,
          },
          {
            type: ResourceType.GLASS,
            count: 1,
          },
        ],
        buildings: [CardId.LIBRARY],
      },
      minPlayersCounts: [3, 4],
    },
    {
      id: CardId.ACADEMY,
      type: CardType.SCIENTIFIC,
      effects: [
        {
          type: EffectType.SCIENTIFIC_SYMBOLS,
          variants: [ScientificSymbolType.COMPASS],
        },
      ],
      price: {
        resources: [
          {
            type: ResourceType.STONE,
            count: 3,
          },
          {
            type: ResourceType.GLASS,
            count: 1,
          },
        ],
        buildings: [CardId.SCHOOL],
      },
      minPlayersCounts: [3, 7],
    },
    {
      id: CardId.STUDY,
      type: CardType.SCIENTIFIC,
      effects: [
        {
          type: EffectType.SCIENTIFIC_SYMBOLS,
          variants: [ScientificSymbolType.GEAR],
        },
      ],
      price: {
        resources: [
          {
            type: ResourceType.WOOD,
            count: 1,
          },
          {
            type: ResourceType.PAPYRUS,
            count: 1,
          },
          {
            type: ResourceType.LOOM,
            count: 1,
          },
        ],
        buildings: [CardId.SCHOOL],
      },
      minPlayersCounts: [3, 5],
    },

    // guilds
    {
      id: CardId.WORKERS_GUILD,
      type: CardType.GUILD,
      effects: [
        {
          type: EffectType.CARDS_TYPE,
          cardTypes: [CardType.RAW_MATERIAL],
          gain: {
            points: 1,
          },
          directions: [PlayerDirection.LEFT, PlayerDirection.RIGHT],
        },
      ],
      price: {
        resources: [
          {
            type: ResourceType.ORE,
            count: 2,
          },
          {
            type: ResourceType.CLAY,
            count: 1,
          },
          {
            type: ResourceType.STONE,
            count: 1,
          },
          {
            type: ResourceType.WOOD,
            count: 1,
          },
        ],
      },
      minPlayersCounts: [],
    },
    {
      id: CardId.CRAFTSMENS_GUILD,
      type: CardType.GUILD,
      effects: [
        {
          type: EffectType.CARDS_TYPE,
          cardTypes: [CardType.MANUFACTURED_GOODS],
          gain: {
            points: 2,
          },
          directions: [PlayerDirection.LEFT, PlayerDirection.RIGHT],
        },
      ],
      price: {
        resources: [
          {
            type: ResourceType.ORE,
            count: 2,
          },
          {
            type: ResourceType.STONE,
            count: 2,
          },
        ],
      },
      minPlayersCounts: [],
    },
    {
      id: CardId.TRADERS_GUILD,
      type: CardType.GUILD,
      effects: [
        {
          type: EffectType.CARDS_TYPE,
          cardTypes: [CardType.COMMERCIAL],
          gain: {
            points: 1,
          },
          directions: [PlayerDirection.LEFT, PlayerDirection.RIGHT],
        },
      ],
      price: {
        resources: [
          {
            type: ResourceType.LOOM,
            count: 1,
          },
          {
            type: ResourceType.PAPYRUS,
            count: 1,
          },
          {
            type: ResourceType.GLASS,
            count: 1,
          },
        ],
      },
      minPlayersCounts: [],
    },
    {
      id: CardId.PHILOSOPHERS_GUILD,
      type: CardType.GUILD,
      effects: [
        {
          type: EffectType.CARDS_TYPE,
          cardTypes: [CardType.SCIENTIFIC],
          gain: {
            points: 1,
          },
          directions: [PlayerDirection.LEFT, PlayerDirection.RIGHT],
        },
      ],
      price: {
        resources: [
          {
            type: ResourceType.CLAY,
            count: 3,
          },
          {
            type: ResourceType.LOOM,
            count: 1,
          },
          {
            type: ResourceType.PAPYRUS,
            count: 1,
          },
        ],
      },
      minPlayersCounts: [],
    },
    {
      id: CardId.SPIES_GUILD,
      type: CardType.GUILD,
      effects: [
        {
          type: EffectType.CARDS_TYPE,
          cardTypes: [CardType.MILITARY],
          gain: {
            points: 1,
          },
          directions: [PlayerDirection.LEFT, PlayerDirection.RIGHT],
        },
      ],
      price: {
        resources: [
          {
            type: ResourceType.CLAY,
            count: 3,
          },
          {
            type: ResourceType.GLASS,
            count: 1,
          },
        ],
      },
      minPlayersCounts: [],
    },
    {
      id: CardId.STRATEGISTS_GUILD,
      type: CardType.GUILD,
      effects: [
        {
          type: EffectType.LOSSES,
          gain: {
            points: 1,
          },
          directions: [PlayerDirection.LEFT, PlayerDirection.RIGHT],
        },
      ],
      price: {
        resources: [
          {
            type: ResourceType.ORE,
            count: 2,
          },
          {
            type: ResourceType.STONE,
            count: 1,
          },
          {
            type: ResourceType.LOOM,
            count: 1,
          },
        ],
      },
      minPlayersCounts: [],
    },
    {
      id: CardId.SHIPOWNERS_GUILD,
      type: CardType.GUILD,
      effects: [
        {
          type: EffectType.CARDS_TYPE,
          cardTypes: [CardType.RAW_MATERIAL],
          gain: {
            points: 1,
          },
          directions: [PlayerDirection.SELF],
        },
        {
          type: EffectType.CARDS_TYPE,
          cardTypes: [CardType.MANUFACTURED_GOODS],
          gain: {
            points: 1,
          },
          directions: [PlayerDirection.SELF],
        },
        {
          type: EffectType.CARDS_TYPE,
          cardTypes: [CardType.GUILD],
          gain: {
            points: 1,
          },
          directions: [PlayerDirection.SELF],
        },
      ],
      price: {
        resources: [
          {
            type: ResourceType.WOOD,
            count: 3,
          },
          {
            type: ResourceType.PAPYRUS,
            count: 1,
          },
          {
            type: ResourceType.GLASS,
            count: 1,
          },
        ],
      },
      minPlayersCounts: [],
    },
    {
      id: CardId.SCIENTISTS_GUILD,
      type: CardType.GUILD,
      effects: [
        {
          type: EffectType.SCIENTIFIC_SYMBOLS,
          variants: [ScientificSymbolType.GEAR, ScientificSymbolType.COMPASS, ScientificSymbolType.TABLET],
        },
      ],
      price: {
        resources: [
          {
            type: ResourceType.WOOD,
            count: 2,
          },
          {
            type: ResourceType.ORE,
            count: 2,
          },
          {
            type: ResourceType.PAPYRUS,
            count: 1,
          },
        ],
      },
      minPlayersCounts: [],
    },
    {
      id: CardId.MAGISTRATES_GUILD,
      type: CardType.GUILD,
      effects: [
        {
          type: EffectType.CARDS_TYPE,
          cardTypes: [CardType.CIVILIAN],
          gain: {
            points: 1,
          },
          directions: [PlayerDirection.LEFT, PlayerDirection.RIGHT],
        },
      ],
      price: {
        resources: [
          {
            type: ResourceType.WOOD,
            count: 3,
          },
          {
            type: ResourceType.STONE,
            count: 1,
          },
          {
            type: ResourceType.LOOM,
            count: 1,
          },
        ],
      },
      minPlayersCounts: [],
    },
    {
      id: CardId.BUILDERS_GUILD,
      type: CardType.GUILD,
      effects: [
        {
          type: EffectType.WONDER_LEVELS,
          gain: {
            points: 1,
          },
          directions: [PlayerDirection.SELF, PlayerDirection.LEFT, PlayerDirection.RIGHT],
        },
      ],
      price: {
        resources: [
          {
            type: ResourceType.STONE,
            count: 2,
          },
          {
            type: ResourceType.CLAY,
            count: 2,
          },
          {
            type: ResourceType.GLASS,
            count: 1,
          },
        ],
      },
      minPlayersCounts: [],
    },
    {
      id: CardId.GAMERS_GUILD,
      type: CardType.GUILD,
      effects: [
        {
          type: EffectType.GAIN_BY_COINS,
          gain: {
            points: 1,
          },
          count: 3,
        },
      ],
      price: {
        resources: [
          {
            type: ResourceType.STONE,
            count: 1,
          },
          {
            type: ResourceType.CLAY,
            count: 1,
          },
          {
            type: ResourceType.WOOD,
            count: 1,
          },
          {
            type: ResourceType.ORE,
            count: 1,
          },
        ],
      },
      minPlayersCounts: [],
      fromLeadersExtension: true,
    },
    {
      id: CardId.COURTESANS_GUILD,
      type: CardType.GUILD,
      effects: [
        {
          type: EffectType.COPY_CARD,
          neighbors: [NeighborSide.LEFT, NeighborSide.RIGHT],
          cardType: CardType.LEADER,
        },
      ],
      price: {
        resources: [
          {
            type: ResourceType.WOOD,
            count: 1,
          },
          {
            type: ResourceType.CLAY,
            count: 1,
          },
          {
            type: ResourceType.GLASS,
            count: 1,
          },
          {
            type: ResourceType.LOOM,
            count: 1,
          },
        ],
      },
      minPlayersCounts: [],
      fromLeadersExtension: true,
    },
    {
      id: CardId.DIPLOMATS_GUILD,
      type: CardType.GUILD,
      effects: [
        {
          type: EffectType.CARDS_TYPE,
          cardTypes: [CardType.LEADER],
          gain: {
            points: 1,
          },
          directions: [PlayerDirection.LEFT, PlayerDirection.RIGHT],
        },
      ],
      price: {
        resources: [
          {
            type: ResourceType.STONE,
            count: 1,
          },
          {
            type: ResourceType.WOOD,
            count: 1,
          },
          {
            type: ResourceType.GLASS,
            count: 1,
          },
          {
            type: ResourceType.PAPYRUS,
            count: 1,
          },
        ],
      },
      minPlayersCounts: [],
      fromLeadersExtension: true,
    },
    {
      id: CardId.ARCHITECTS_GUILD,
      type: CardType.GUILD,
      effects: [
        {
          type: EffectType.CARDS_TYPE,
          cardTypes: [CardType.GUILD],
          gain: {
            points: 3,
          },
          directions: [PlayerDirection.LEFT, PlayerDirection.RIGHT],
        },
      ],
      price: {
        resources: [
          {
            type: ResourceType.ORE,
            count: 3,
          },
          {
            type: ResourceType.CLAY,
            count: 1,
          },
          {
            type: ResourceType.PAPYRUS,
            count: 1,
          },
          {
            type: ResourceType.LOOM,
            count: 1,
          },
        ],
      },
      minPlayersCounts: [],
      fromLeadersExtension: true,
    },
  ],
];

export default CARDS_BY_AGE;
