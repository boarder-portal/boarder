import {
  ECardActionType,
  ECity,
  ENeighborSide,
  EPlayerDirection,
  EResource,
  EScientificSymbol,
  ICity,
} from 'common/types/sevenWonders';
import { EEffect, EFreeCardPeriod, EFreeCardSource } from 'common/types/sevenWonders/effects';
import { ECardType } from 'common/types/sevenWonders/cards';

const CITIES: Record<ECity, ICity> = {
  [ECity.RHODOS]: {
    sides: [
      {
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
        wonders: [
          {
            price: {
              resources: [
                {
                  type: EResource.WOOD,
                  count: 2,
                },
              ],
            },
            effects: [
              {
                type: EEffect.GAIN,
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
                  type: EResource.CLAY,
                  count: 3,
                },
              ],
            },
            effects: [
              {
                type: EEffect.SHIELDS,
                count: 2,
              },
            ],
          },
          {
            price: {
              resources: [
                {
                  type: EResource.ORE,
                  count: 4,
                },
              ],
            },
            effects: [
              {
                type: EEffect.GAIN,
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
            type: EEffect.RESOURCES,
            variants: [
              {
                type: EResource.ORE,
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
                  type: EResource.STONE,
                  count: 3,
                },
              ],
            },
            effects: [
              {
                type: EEffect.SHIELDS,
                count: 1,
              },
              {
                type: EEffect.GAIN,
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
                  type: EResource.ORE,
                  count: 4,
                },
              ],
            },
            effects: [
              {
                type: EEffect.SHIELDS,
                count: 1,
              },
              {
                type: EEffect.GAIN,
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
  [ECity.ALEXANDRIA]: {
    sides: [
      {
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
        wonders: [
          {
            price: {
              resources: [
                {
                  type: EResource.STONE,
                  count: 2,
                },
              ],
            },
            effects: [
              {
                type: EEffect.GAIN,
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
                  type: EResource.ORE,
                  count: 2,
                },
              ],
            },
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
                  {
                    type: EResource.WOOD,
                    count: 1,
                  },
                  {
                    type: EResource.STONE,
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
                  type: EResource.GLASS,
                  count: 2,
                },
              ],
            },
            effects: [
              {
                type: EEffect.GAIN,
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
            type: EEffect.RESOURCES,
            variants: [
              {
                type: EResource.GLASS,
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
                  type: EResource.CLAY,
                  count: 2,
                },
              ],
            },
            effects: [
              {
                type: EEffect.RESOURCES,
                variants: [
                  {
                    type: EResource.WOOD,
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
                    type: EResource.CLAY,
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
                  type: EResource.WOOD,
                  count: 2,
                },
              ],
            },
            effects: [
              {
                type: EEffect.RESOURCES,
                variants: [
                  {
                    type: EResource.GLASS,
                    count: 1,
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
            ],
          },
          {
            price: {
              resources: [
                {
                  type: EResource.STONE,
                  count: 3,
                },
              ],
            },
            effects: [
              {
                type: EEffect.GAIN,
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
  [ECity.EPHESOS]: {
    sides: [
      {
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
        wonders: [
          {
            price: {
              resources: [
                {
                  type: EResource.STONE,
                  count: 2,
                },
              ],
            },
            effects: [
              {
                type: EEffect.GAIN,
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
                  type: EResource.WOOD,
                  count: 2,
                },
              ],
            },
            effects: [
              {
                type: EEffect.GAIN,
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
                  type: EResource.PAPYRUS,
                  count: 2,
                },
              ],
            },
            effects: [
              {
                type: EEffect.GAIN,
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
            type: EEffect.RESOURCES,
            variants: [
              {
                type: EResource.PAPYRUS,
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
                  type: EResource.STONE,
                  count: 2,
                },
              ],
            },
            effects: [
              {
                type: EEffect.GAIN,
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
                  type: EResource.WOOD,
                  count: 2,
                },
              ],
            },
            effects: [
              {
                type: EEffect.GAIN,
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
            },
            effects: [
              {
                type: EEffect.GAIN,
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
  [ECity.BABYLON]: {
    sides: [
      {
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
        wonders: [
          {
            price: {
              resources: [
                {
                  type: EResource.CLAY,
                  count: 2,
                },
              ],
            },
            effects: [
              {
                type: EEffect.GAIN,
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
                  type: EResource.WOOD,
                  count: 3,
                },
              ],
            },
            effects: [
              {
                type: EEffect.SCIENTIFIC_SYMBOLS,
                variants: [EScientificSymbol.TABLET, EScientificSymbol.COMPASS, EScientificSymbol.GEAR],
              },
            ],
          },
          {
            price: {
              resources: [
                {
                  type: EResource.CLAY,
                  count: 4,
                },
              ],
            },
            effects: [
              {
                type: EEffect.GAIN,
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
            type: EEffect.RESOURCES,
            variants: [
              {
                type: EResource.CLAY,
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
                  type: EResource.LOOM,
                  count: 1,
                },
                {
                  type: EResource.CLAY,
                  count: 1,
                },
              ],
            },
            effects: [
              {
                type: EEffect.GAIN,
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
                  type: EResource.GLASS,
                  count: 1,
                },
                {
                  type: EResource.WOOD,
                  count: 2,
                },
              ],
            },
            effects: [
              {
                type: EEffect.BUILD_CARD,
                period: EFreeCardPeriod.LAST_AGE_TURN,
                count: 1,
                source: EFreeCardSource.HAND,
                isFree: false,
                possibleActions: [
                  ECardActionType.BUILD_STRUCTURE,
                  ECardActionType.BUILD_WONDER_STAGE,
                  ECardActionType.DISCARD,
                ],
              },
            ],
          },
          {
            price: {
              resources: [
                {
                  type: EResource.PAPYRUS,
                  count: 1,
                },
                {
                  type: EResource.CLAY,
                  count: 3,
                },
              ],
            },
            effects: [
              {
                type: EEffect.SCIENTIFIC_SYMBOLS,
                variants: [EScientificSymbol.TABLET, EScientificSymbol.COMPASS, EScientificSymbol.GEAR],
              },
            ],
          },
        ],
      },
    ],
  },
  [ECity.OLYMPIA]: {
    sides: [
      {
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
        wonders: [
          {
            price: {
              resources: [
                {
                  type: EResource.WOOD,
                  count: 2,
                },
              ],
            },
            effects: [
              {
                type: EEffect.GAIN,
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
                  type: EResource.STONE,
                  count: 2,
                },
              ],
            },
            effects: [
              {
                type: EEffect.BUILD_CARD,
                period: EFreeCardPeriod.AGE,
                count: 1,
                cardTypes: [
                  ECardType.RAW_MATERIAL,
                  ECardType.MANUFACTURED_GOODS,
                  ECardType.CIVILIAN,
                  ECardType.COMMERCIAL,
                  ECardType.SCIENTIFIC,
                  ECardType.MILITARY,
                  ECardType.GUILD,
                ],
                source: EFreeCardSource.HAND,
                isFree: true,
                possibleActions: [ECardActionType.BUILD_STRUCTURE],
              },
            ],
          },
          {
            price: {
              resources: [
                {
                  type: EResource.ORE,
                  count: 2,
                },
              ],
            },
            effects: [
              {
                type: EEffect.GAIN,
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
            type: EEffect.RESOURCES,
            variants: [
              {
                type: EResource.WOOD,
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
                  type: EResource.WOOD,
                  count: 2,
                },
              ],
            },
            effects: [
              {
                type: EEffect.TRADE,
                sources: [ENeighborSide.LEFT, ENeighborSide.RIGHT],
                price: 1,
                resources: [ECardType.RAW_MATERIAL],
              },
            ],
          },
          {
            price: {
              resources: [
                {
                  type: EResource.STONE,
                  count: 2,
                },
              ],
            },
            effects: [
              {
                type: EEffect.GAIN,
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
                  type: EResource.LOOM,
                  count: 1,
                },
                {
                  type: EResource.ORE,
                  count: 2,
                },
              ],
            },
            effects: [
              {
                type: EEffect.COPY_CARD,
                neighbors: [ENeighborSide.LEFT, ENeighborSide.RIGHT],
                cardType: ECardType.GUILD,
              },
            ],
          },
        ],
      },
    ],
  },
  [ECity.HALIKARNASSOS]: {
    sides: [
      {
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
        wonders: [
          {
            price: {
              resources: [
                {
                  type: EResource.CLAY,
                  count: 2,
                },
              ],
            },
            effects: [
              {
                type: EEffect.GAIN,
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
                  type: EResource.ORE,
                  count: 3,
                },
              ],
            },
            effects: [
              {
                type: EEffect.BUILD_CARD,
                period: EFreeCardPeriod.NOW,
                count: 1,
                source: EFreeCardSource.DISCARD,
                isFree: true,
                possibleActions: [ECardActionType.BUILD_STRUCTURE],
                priority: 100,
              },
            ],
          },
          {
            price: {
              resources: [
                {
                  type: EResource.LOOM,
                  count: 2,
                },
              ],
            },
            effects: [
              {
                type: EEffect.GAIN,
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
            type: EEffect.RESOURCES,
            variants: [
              {
                type: EResource.LOOM,
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
                  type: EResource.ORE,
                  count: 2,
                },
              ],
            },
            effects: [
              {
                type: EEffect.GAIN,
                gain: {
                  points: 2,
                },
              },
              {
                type: EEffect.BUILD_CARD,
                period: EFreeCardPeriod.NOW,
                count: 1,
                source: EFreeCardSource.DISCARD,
                isFree: true,
                possibleActions: [ECardActionType.BUILD_STRUCTURE],
                priority: 100,
              },
            ],
          },
          {
            price: {
              resources: [
                {
                  type: EResource.CLAY,
                  count: 3,
                },
              ],
            },
            effects: [
              {
                type: EEffect.GAIN,
                gain: {
                  points: 1,
                },
              },
              {
                type: EEffect.BUILD_CARD,
                period: EFreeCardPeriod.NOW,
                count: 1,
                source: EFreeCardSource.DISCARD,
                isFree: true,
                possibleActions: [ECardActionType.BUILD_STRUCTURE],
                priority: 100,
              },
            ],
          },
          {
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
              ],
            },
            effects: [
              {
                type: EEffect.BUILD_CARD,
                period: EFreeCardPeriod.NOW,
                count: 1,
                source: EFreeCardSource.DISCARD,
                isFree: true,
                possibleActions: [ECardActionType.BUILD_STRUCTURE],
                priority: 100,
              },
            ],
          },
        ],
      },
    ],
  },
  [ECity.GIZAH]: {
    sides: [
      {
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
        wonders: [
          {
            price: {
              resources: [
                {
                  type: EResource.STONE,
                  count: 2,
                },
              ],
            },
            effects: [
              {
                type: EEffect.GAIN,
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
                  type: EResource.WOOD,
                  count: 3,
                },
              ],
            },
            effects: [
              {
                type: EEffect.GAIN,
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
                  type: EResource.STONE,
                  count: 4,
                },
              ],
            },
            effects: [
              {
                type: EEffect.GAIN,
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
            type: EEffect.RESOURCES,
            variants: [
              {
                type: EResource.STONE,
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
                  type: EResource.WOOD,
                  count: 2,
                },
              ],
            },
            effects: [
              {
                type: EEffect.GAIN,
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
                  type: EResource.STONE,
                  count: 3,
                },
              ],
            },
            effects: [
              {
                type: EEffect.GAIN,
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
                  type: EResource.CLAY,
                  count: 3,
                },
              ],
            },
            effects: [
              {
                type: EEffect.GAIN,
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
                  type: EResource.PAPYRUS,
                  count: 1,
                },
                {
                  type: EResource.STONE,
                  count: 4,
                },
              ],
            },
            effects: [
              {
                type: EEffect.GAIN,
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
  [ECity.ROMA]: {
    sides: [
      {
        effects: [
          {
            type: EEffect.BUILD_CARD,
            period: EFreeCardPeriod.LEADER_RECRUITMENT,
            cardTypes: [ECardType.LEADER],
            isFree: true,
            source: EFreeCardSource.LEADERS,
            possibleActions: [ECardActionType.BUILD_STRUCTURE],
          },
        ],
        wonders: [
          {
            price: {
              resources: [
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
            effects: [
              {
                type: EEffect.GAIN,
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
                  type: EResource.STONE,
                  count: 2,
                },
                {
                  type: EResource.CLAY,
                  count: 1,
                },
                {
                  type: EResource.LOOM,
                  count: 1,
                },
              ],
            },
            effects: [
              {
                type: EEffect.GAIN,
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
            type: EEffect.REDUCED_PRICE,
            objectType: ECardType.LEADER,
            discount: {
              coins: 1,
            },
            direction: EPlayerDirection.LEFT,
          },
          {
            type: EEffect.REDUCED_PRICE,
            objectType: ECardType.LEADER,
            discount: {
              coins: 2,
            },
            direction: EPlayerDirection.SELF,
          },
          {
            type: EEffect.REDUCED_PRICE,
            objectType: ECardType.LEADER,
            discount: {
              coins: 1,
            },
            direction: EPlayerDirection.RIGHT,
          },
        ],
        wonders: [
          {
            price: {
              resources: [
                {
                  type: EResource.CLAY,
                  count: 1,
                },
                {
                  type: EResource.WOOD,
                  count: 1,
                },
              ],
            },
            effects: [
              {
                type: EEffect.GAIN,
                gain: {
                  coins: 5,
                },
              },
              {
                type: EEffect.DRAW_LEADERS,
                count: 4,
              },
            ],
          },
          {
            price: {
              resources: [
                {
                  type: EResource.LOOM,
                  count: 1,
                },
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
            effects: [
              {
                type: EEffect.GAIN,
                gain: {
                  points: 3,
                },
              },
              {
                type: EEffect.BUILD_CARD,
                period: EFreeCardPeriod.NOW,
                cardTypes: [ECardType.LEADER],
                source: EFreeCardSource.LEADERS,
                count: 1,
                isFree: false,
                possibleActions: [ECardActionType.BUILD_STRUCTURE],
              },
            ],
          },
          {
            price: {
              resources: [
                {
                  type: EResource.PAPYRUS,
                  count: 1,
                },
                {
                  type: EResource.STONE,
                  count: 2,
                },
              ],
            },
            effects: [
              {
                type: EEffect.GAIN,
                gain: {
                  points: 3,
                },
              },
              {
                type: EEffect.BUILD_CARD,
                period: EFreeCardPeriod.NOW,
                cardTypes: [ECardType.LEADER],
                isFree: false,
                source: EFreeCardSource.LEADERS,
                count: 1,
                possibleActions: [ECardActionType.BUILD_STRUCTURE],
              },
            ],
          },
        ],
      },
    ],
  },
};

export default CITIES;
