import {
  CardActionType,
  City,
  CityName,
  NeighborSide,
  PlayerDirection,
  ResourceType,
  ScientificSymbolType,
} from 'common/types/games/sevenWonders';
import { CardType } from 'common/types/games/sevenWonders/cards';
import { EffectType, FreeCardPeriodType, FreeCardSourceType } from 'common/types/games/sevenWonders/effects';

const CITIES: Record<CityName, City> = {
  [CityName.RHODOS]: {
    sides: [
      {
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
        wonders: [
          {
            price: {
              resources: [
                {
                  type: ResourceType.WOOD,
                  count: 2,
                },
              ],
            },
            effects: [
              {
                type: EffectType.GAIN,
                gain: {
                  points: 3,
                },
              },
            ],
          },
          {
            price: {
              resources: [
                {
                  type: ResourceType.CLAY,
                  count: 3,
                },
              ],
            },
            effects: [
              {
                type: EffectType.SHIELDS,
                count: 2,
              },
            ],
          },
          {
            price: {
              resources: [
                {
                  type: ResourceType.ORE,
                  count: 4,
                },
              ],
            },
            effects: [
              {
                type: EffectType.GAIN,
                gain: {
                  points: 7,
                },
              },
            ],
          },
        ],
      },
      {
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
        wonders: [
          {
            price: {
              resources: [
                {
                  type: ResourceType.STONE,
                  count: 3,
                },
              ],
            },
            effects: [
              {
                type: EffectType.SHIELDS,
                count: 1,
              },
              {
                type: EffectType.GAIN,
                gain: {
                  points: 3,
                  coins: 3,
                },
              },
            ],
            position: 0.385,
          },
          {
            price: {
              resources: [
                {
                  type: ResourceType.ORE,
                  count: 4,
                },
              ],
            },
            effects: [
              {
                type: EffectType.SHIELDS,
                count: 1,
              },
              {
                type: EffectType.GAIN,
                gain: {
                  points: 4,
                  coins: 4,
                },
              },
            ],
            position: 0.682,
          },
        ],
      },
    ],
  },
  [CityName.ALEXANDRIA]: {
    sides: [
      {
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
        wonders: [
          {
            price: {
              resources: [
                {
                  type: ResourceType.STONE,
                  count: 2,
                },
              ],
            },
            effects: [
              {
                type: EffectType.GAIN,
                gain: {
                  points: 3,
                },
              },
            ],
          },
          {
            price: {
              resources: [
                {
                  type: ResourceType.ORE,
                  count: 2,
                },
              ],
            },
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
                  {
                    type: ResourceType.WOOD,
                    count: 1,
                  },
                  {
                    type: ResourceType.STONE,
                    count: 1,
                  },
                ],
              },
            ],
          },
          {
            price: {
              resources: [
                {
                  type: ResourceType.GLASS,
                  count: 2,
                },
              ],
            },
            effects: [
              {
                type: EffectType.GAIN,
                gain: {
                  points: 7,
                },
              },
            ],
          },
        ],
      },
      {
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
        wonders: [
          {
            price: {
              resources: [
                {
                  type: ResourceType.CLAY,
                  count: 2,
                },
              ],
            },
            effects: [
              {
                type: EffectType.RESOURCES,
                variants: [
                  {
                    type: ResourceType.WOOD,
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
                    type: ResourceType.CLAY,
                    count: 1,
                  },
                ],
              },
            ],
          },
          {
            price: {
              resources: [
                {
                  type: ResourceType.WOOD,
                  count: 2,
                },
              ],
            },
            effects: [
              {
                type: EffectType.RESOURCES,
                variants: [
                  {
                    type: ResourceType.GLASS,
                    count: 1,
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
            ],
          },
          {
            price: {
              resources: [
                {
                  type: ResourceType.STONE,
                  count: 3,
                },
              ],
            },
            effects: [
              {
                type: EffectType.GAIN,
                gain: {
                  points: 7,
                },
              },
            ],
          },
        ],
      },
    ],
  },
  [CityName.EPHESOS]: {
    sides: [
      {
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
        wonders: [
          {
            price: {
              resources: [
                {
                  type: ResourceType.STONE,
                  count: 2,
                },
              ],
            },
            effects: [
              {
                type: EffectType.GAIN,
                gain: {
                  points: 3,
                },
              },
            ],
          },
          {
            price: {
              resources: [
                {
                  type: ResourceType.WOOD,
                  count: 2,
                },
              ],
            },
            effects: [
              {
                type: EffectType.GAIN,
                gain: {
                  coins: 9,
                },
              },
            ],
          },
          {
            price: {
              resources: [
                {
                  type: ResourceType.PAPYRUS,
                  count: 2,
                },
              ],
            },
            effects: [
              {
                type: EffectType.GAIN,
                gain: {
                  points: 7,
                },
              },
            ],
          },
        ],
      },
      {
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
        wonders: [
          {
            price: {
              resources: [
                {
                  type: ResourceType.STONE,
                  count: 2,
                },
              ],
            },
            effects: [
              {
                type: EffectType.GAIN,
                gain: {
                  points: 2,
                  coins: 4,
                },
              },
            ],
          },
          {
            price: {
              resources: [
                {
                  type: ResourceType.WOOD,
                  count: 2,
                },
              ],
            },
            effects: [
              {
                type: EffectType.GAIN,
                gain: {
                  points: 3,
                  coins: 4,
                },
              },
            ],
          },
          {
            price: {
              resources: [
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
            },
            effects: [
              {
                type: EffectType.GAIN,
                gain: {
                  points: 5,
                  coins: 4,
                },
              },
            ],
          },
        ],
      },
    ],
  },
  [CityName.BABYLON]: {
    sides: [
      {
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
        wonders: [
          {
            price: {
              resources: [
                {
                  type: ResourceType.CLAY,
                  count: 2,
                },
              ],
            },
            effects: [
              {
                type: EffectType.GAIN,
                gain: {
                  points: 3,
                },
              },
            ],
          },
          {
            price: {
              resources: [
                {
                  type: ResourceType.WOOD,
                  count: 3,
                },
              ],
            },
            effects: [
              {
                type: EffectType.SCIENTIFIC_SYMBOLS,
                variants: [ScientificSymbolType.TABLET, ScientificSymbolType.COMPASS, ScientificSymbolType.GEAR],
              },
            ],
          },
          {
            price: {
              resources: [
                {
                  type: ResourceType.CLAY,
                  count: 4,
                },
              ],
            },
            effects: [
              {
                type: EffectType.GAIN,
                gain: {
                  points: 7,
                },
              },
            ],
          },
        ],
      },
      {
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
        wonders: [
          {
            price: {
              resources: [
                {
                  type: ResourceType.LOOM,
                  count: 1,
                },
                {
                  type: ResourceType.CLAY,
                  count: 1,
                },
              ],
            },
            effects: [
              {
                type: EffectType.GAIN,
                gain: {
                  points: 3,
                },
              },
            ],
          },
          {
            price: {
              resources: [
                {
                  type: ResourceType.GLASS,
                  count: 1,
                },
                {
                  type: ResourceType.WOOD,
                  count: 2,
                },
              ],
            },
            effects: [
              {
                type: EffectType.BUILD_CARD,
                period: FreeCardPeriodType.LAST_AGE_TURN,
                count: 1,
                source: FreeCardSourceType.HAND,
                isFree: false,
                possibleActions: [
                  CardActionType.BUILD_STRUCTURE,
                  CardActionType.BUILD_WONDER_STAGE,
                  CardActionType.DISCARD,
                ],
              },
            ],
          },
          {
            price: {
              resources: [
                {
                  type: ResourceType.PAPYRUS,
                  count: 1,
                },
                {
                  type: ResourceType.CLAY,
                  count: 3,
                },
              ],
            },
            effects: [
              {
                type: EffectType.SCIENTIFIC_SYMBOLS,
                variants: [ScientificSymbolType.TABLET, ScientificSymbolType.COMPASS, ScientificSymbolType.GEAR],
              },
            ],
          },
        ],
      },
    ],
  },
  [CityName.OLYMPIA]: {
    sides: [
      {
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
        wonders: [
          {
            price: {
              resources: [
                {
                  type: ResourceType.WOOD,
                  count: 2,
                },
              ],
            },
            effects: [
              {
                type: EffectType.GAIN,
                gain: {
                  points: 3,
                },
              },
            ],
          },
          {
            price: {
              resources: [
                {
                  type: ResourceType.STONE,
                  count: 2,
                },
              ],
            },
            effects: [
              {
                type: EffectType.BUILD_CARD,
                period: FreeCardPeriodType.AGE,
                count: 1,
                cardTypes: [
                  CardType.RAW_MATERIAL,
                  CardType.MANUFACTURED_GOODS,
                  CardType.CIVILIAN,
                  CardType.COMMERCIAL,
                  CardType.SCIENTIFIC,
                  CardType.MILITARY,
                  CardType.GUILD,
                ],
                source: FreeCardSourceType.HAND,
                isFree: true,
                possibleActions: [CardActionType.BUILD_STRUCTURE],
              },
            ],
          },
          {
            price: {
              resources: [
                {
                  type: ResourceType.ORE,
                  count: 2,
                },
              ],
            },
            effects: [
              {
                type: EffectType.GAIN,
                gain: {
                  points: 7,
                },
              },
            ],
          },
        ],
      },
      {
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
        wonders: [
          {
            price: {
              resources: [
                {
                  type: ResourceType.WOOD,
                  count: 2,
                },
              ],
            },
            effects: [
              {
                type: EffectType.TRADE,
                sources: [NeighborSide.LEFT, NeighborSide.RIGHT],
                price: 1,
                resources: [CardType.RAW_MATERIAL],
              },
            ],
          },
          {
            price: {
              resources: [
                {
                  type: ResourceType.STONE,
                  count: 2,
                },
              ],
            },
            effects: [
              {
                type: EffectType.GAIN,
                gain: {
                  points: 5,
                },
              },
            ],
          },
          {
            price: {
              resources: [
                {
                  type: ResourceType.LOOM,
                  count: 1,
                },
                {
                  type: ResourceType.ORE,
                  count: 2,
                },
              ],
            },
            effects: [
              {
                type: EffectType.COPY_CARD,
                neighbors: [NeighborSide.LEFT, NeighborSide.RIGHT],
                cardType: CardType.GUILD,
              },
            ],
          },
        ],
      },
    ],
  },
  [CityName.HALIKARNASSOS]: {
    sides: [
      {
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
        wonders: [
          {
            price: {
              resources: [
                {
                  type: ResourceType.CLAY,
                  count: 2,
                },
              ],
            },
            effects: [
              {
                type: EffectType.GAIN,
                gain: {
                  points: 3,
                },
              },
            ],
          },
          {
            price: {
              resources: [
                {
                  type: ResourceType.ORE,
                  count: 3,
                },
              ],
            },
            effects: [
              {
                type: EffectType.BUILD_CARD,
                period: FreeCardPeriodType.NOW,
                count: 1,
                source: FreeCardSourceType.DISCARD,
                isFree: true,
                possibleActions: [CardActionType.BUILD_STRUCTURE],
                priority: 100,
              },
            ],
          },
          {
            price: {
              resources: [
                {
                  type: ResourceType.LOOM,
                  count: 2,
                },
              ],
            },
            effects: [
              {
                type: EffectType.GAIN,
                gain: {
                  points: 7,
                },
              },
            ],
          },
        ],
      },
      {
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
        wonders: [
          {
            price: {
              resources: [
                {
                  type: ResourceType.ORE,
                  count: 2,
                },
              ],
            },
            effects: [
              {
                type: EffectType.GAIN,
                gain: {
                  points: 2,
                },
              },
              {
                type: EffectType.BUILD_CARD,
                period: FreeCardPeriodType.NOW,
                count: 1,
                source: FreeCardSourceType.DISCARD,
                isFree: true,
                possibleActions: [CardActionType.BUILD_STRUCTURE],
                priority: 100,
              },
            ],
          },
          {
            price: {
              resources: [
                {
                  type: ResourceType.CLAY,
                  count: 3,
                },
              ],
            },
            effects: [
              {
                type: EffectType.GAIN,
                gain: {
                  points: 1,
                },
              },
              {
                type: EffectType.BUILD_CARD,
                period: FreeCardPeriodType.NOW,
                count: 1,
                source: FreeCardSourceType.DISCARD,
                isFree: true,
                possibleActions: [CardActionType.BUILD_STRUCTURE],
                priority: 100,
              },
            ],
          },
          {
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
              ],
            },
            effects: [
              {
                type: EffectType.BUILD_CARD,
                period: FreeCardPeriodType.NOW,
                count: 1,
                source: FreeCardSourceType.DISCARD,
                isFree: true,
                possibleActions: [CardActionType.BUILD_STRUCTURE],
                priority: 100,
              },
            ],
          },
        ],
      },
    ],
  },
  [CityName.GIZAH]: {
    sides: [
      {
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
        wonders: [
          {
            price: {
              resources: [
                {
                  type: ResourceType.STONE,
                  count: 2,
                },
              ],
            },
            effects: [
              {
                type: EffectType.GAIN,
                gain: {
                  points: 3,
                },
              },
            ],
          },
          {
            price: {
              resources: [
                {
                  type: ResourceType.WOOD,
                  count: 3,
                },
              ],
            },
            effects: [
              {
                type: EffectType.GAIN,
                gain: {
                  points: 5,
                },
              },
            ],
          },
          {
            price: {
              resources: [
                {
                  type: ResourceType.STONE,
                  count: 4,
                },
              ],
            },
            effects: [
              {
                type: EffectType.GAIN,
                gain: {
                  points: 7,
                },
              },
            ],
          },
        ],
      },
      {
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
        wonders: [
          {
            price: {
              resources: [
                {
                  type: ResourceType.WOOD,
                  count: 2,
                },
              ],
            },
            effects: [
              {
                type: EffectType.GAIN,
                gain: {
                  points: 3,
                },
              },
            ],
            position: 0,
          },
          {
            price: {
              resources: [
                {
                  type: ResourceType.STONE,
                  count: 3,
                },
              ],
            },
            effects: [
              {
                type: EffectType.GAIN,
                gain: {
                  points: 5,
                },
              },
            ],
            position: 0.257,
          },
          {
            price: {
              resources: [
                {
                  type: ResourceType.CLAY,
                  count: 3,
                },
              ],
            },
            effects: [
              {
                type: EffectType.GAIN,
                gain: {
                  points: 5,
                },
              },
            ],
            position: 0.527,
          },
          {
            price: {
              resources: [
                {
                  type: ResourceType.PAPYRUS,
                  count: 1,
                },
                {
                  type: ResourceType.STONE,
                  count: 4,
                },
              ],
            },
            effects: [
              {
                type: EffectType.GAIN,
                gain: {
                  points: 7,
                },
              },
            ],
            position: 0.78,
          },
        ],
      },
    ],
  },
  [CityName.ROMA]: {
    sides: [
      {
        effects: [
          {
            type: EffectType.BUILD_CARD,
            period: FreeCardPeriodType.LEADER_RECRUITMENT,
            cardTypes: [CardType.LEADER],
            isFree: true,
            source: FreeCardSourceType.LEADERS,
            possibleActions: [CardActionType.BUILD_STRUCTURE],
          },
        ],
        wonders: [
          {
            price: {
              resources: [
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
            effects: [
              {
                type: EffectType.GAIN,
                gain: {
                  points: 4,
                },
              },
            ],
            position: 0.207,
          },
          {
            price: {
              resources: [
                {
                  type: ResourceType.STONE,
                  count: 2,
                },
                {
                  type: ResourceType.CLAY,
                  count: 1,
                },
                {
                  type: ResourceType.LOOM,
                  count: 1,
                },
              ],
            },
            effects: [
              {
                type: EffectType.GAIN,
                gain: {
                  points: 6,
                },
              },
            ],
            position: 0.568,
          },
        ],
      },
      {
        effects: [
          {
            type: EffectType.REDUCED_PRICE,
            objectType: CardType.LEADER,
            discount: {
              coins: 1,
            },
            direction: PlayerDirection.LEFT,
          },
          {
            type: EffectType.REDUCED_PRICE,
            objectType: CardType.LEADER,
            discount: {
              coins: 2,
            },
            direction: PlayerDirection.SELF,
          },
          {
            type: EffectType.REDUCED_PRICE,
            objectType: CardType.LEADER,
            discount: {
              coins: 1,
            },
            direction: PlayerDirection.RIGHT,
          },
        ],
        wonders: [
          {
            price: {
              resources: [
                {
                  type: ResourceType.CLAY,
                  count: 1,
                },
                {
                  type: ResourceType.WOOD,
                  count: 1,
                },
              ],
            },
            effects: [
              {
                type: EffectType.GAIN,
                gain: {
                  coins: 5,
                },
              },
              {
                type: EffectType.DRAW_LEADERS,
                count: 4,
              },
            ],
          },
          {
            price: {
              resources: [
                {
                  type: ResourceType.LOOM,
                  count: 1,
                },
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
            effects: [
              {
                type: EffectType.GAIN,
                gain: {
                  points: 3,
                },
              },
              {
                type: EffectType.BUILD_CARD,
                period: FreeCardPeriodType.NOW,
                cardTypes: [CardType.LEADER],
                source: FreeCardSourceType.LEADERS,
                count: 1,
                isFree: false,
                possibleActions: [CardActionType.BUILD_STRUCTURE],
              },
            ],
          },
          {
            price: {
              resources: [
                {
                  type: ResourceType.PAPYRUS,
                  count: 1,
                },
                {
                  type: ResourceType.STONE,
                  count: 2,
                },
              ],
            },
            effects: [
              {
                type: EffectType.GAIN,
                gain: {
                  points: 3,
                },
              },
              {
                type: EffectType.BUILD_CARD,
                period: FreeCardPeriodType.NOW,
                cardTypes: [CardType.LEADER],
                isFree: false,
                source: FreeCardSourceType.LEADERS,
                count: 1,
                possibleActions: [CardActionType.BUILD_STRUCTURE],
              },
            ],
          },
        ],
      },
    ],
  },
};

export default CITIES;
