import { ECardId, ECardType, ICard } from 'common/types/sevenWonders/cards';
import { ECoinPassiveSource, EEffect, EFreeCardPeriod, EFreeCardSource } from 'common/types/sevenWonders/effects';
import { ECardActionType, EPlayerDirection, EScientificSymbol } from 'common/types/sevenWonders';

const LEADERS: ICard[] = [
  {
    id: ECardId.AMYTIS,
    type: ECardType.LEADER,
    effects: [
      {
        type: EEffect.WONDER_LEVELS,
        gain: {
          points: 2,
        },
        directions: [EPlayerDirection.SELF],
      },
    ],
    price: {
      coins: 4,
    },
    minPlayersCounts: [],
  },
  {
    id: ECardId.MIDAS,
    type: ECardType.LEADER,
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
      coins: 3,
    },
    minPlayersCounts: [],
  },
  {
    id: ECardId.ALEXANDER,
    type: ECardType.LEADER,
    effects: [
      {
        type: EEffect.WINS,
        gain: {
          points: 1,
        },
        directions: [EPlayerDirection.SELF],
      },
    ],
    price: {
      coins: 3,
    },
    minPlayersCounts: [],
  },
  {
    id: ECardId.BILKIS,
    type: ECardType.LEADER,
    effects: [
      {
        type: EEffect.TRADE,
        price: 1,
        resources: [ECardType.RAW_MATERIAL, ECardType.MANUFACTURED_GOODS],
        sources: ['bank'],
      },
    ],
    price: {
      coins: 4,
    },
    minPlayersCounts: [],
  },
  {
    id: ECardId.ARISTOTLE,
    type: ECardType.LEADER,
    effects: [
      {
        type: EEffect.SCIENTIFIC_SET,
        gain: {
          points: 3,
        },
      },
    ],
    price: {
      coins: 3,
    },
    minPlayersCounts: [],
  },
  {
    id: ECardId.MAECENAS,
    type: ECardType.LEADER,
    effects: [
      {
        type: EEffect.BUILD_CARD,
        source: EFreeCardSource.LEADERS,
        cardTypes: [ECardType.LEADER],
        isFree: true,
        period: EFreeCardPeriod.LEADER_RECRUITMENT,
        possibleActions: [ECardActionType.BUILD_STRUCTURE],
      },
    ],
    price: {
      coins: 1,
    },
    minPlayersCounts: [],
  },
  {
    id: ECardId.JUSTINIAN,
    type: ECardType.LEADER,
    effects: [
      {
        type: EEffect.CARDS_TYPE,
        cardTypes: [ECardType.CIVILIAN, ECardType.MILITARY, ECardType.SCIENTIFIC],
        gain: {
          points: 3,
        },
        directions: [EPlayerDirection.SELF],
      },
    ],
    price: {
      coins: 3,
    },
    minPlayersCounts: [],
  },
  {
    id: ECardId.PLATO,
    type: ECardType.LEADER,
    effects: [
      {
        type: EEffect.CARDS_TYPE,
        cardTypes: [
          ECardType.RAW_MATERIAL,
          ECardType.MANUFACTURED_GOODS,
          ECardType.CIVILIAN,
          ECardType.COMMERCIAL,
          ECardType.SCIENTIFIC,
          ECardType.MILITARY,
          ECardType.GUILD,
        ],
        gain: {
          points: 7,
        },
        directions: [EPlayerDirection.SELF],
      },
    ],
    price: {
      coins: 4,
    },
    minPlayersCounts: [],
  },
  {
    id: ECardId.RAMSES,
    type: ECardType.LEADER,
    effects: [
      {
        type: EEffect.BUILD_CARD,
        source: EFreeCardSource.HAND,
        cardTypes: [ECardType.GUILD],
        isFree: true,
        period: EFreeCardPeriod.ETERNITY,
        possibleActions: [ECardActionType.BUILD_STRUCTURE],
      },
    ],
    price: {
      coins: 5,
    },
    minPlayersCounts: [],
  },
  {
    id: ECardId.TOMYRIS,
    type: ECardType.LEADER,
    effects: [
      {
        type: EEffect.RETURN_DEFEATS,
      },
    ],
    price: {
      coins: 4,
    },
    minPlayersCounts: [],
  },
  {
    id: ECardId.HANNIBAL,
    type: ECardType.LEADER,
    effects: [
      {
        type: EEffect.SHIELDS,
        count: 1,
      },
    ],
    price: {
      coins: 2,
    },
    minPlayersCounts: [],
  },
  {
    id: ECardId.CAESAR,
    type: ECardType.LEADER,
    effects: [
      {
        type: EEffect.SHIELDS,
        count: 2,
      },
    ],
    price: {
      coins: 5,
    },
    minPlayersCounts: [],
  },
  {
    id: ECardId.NERO,
    type: ECardType.LEADER,
    effects: [
      {
        type: EEffect.COIN_PASSIVE,
        source: ECoinPassiveSource.VICTORY_TOKENS,
        count: 2,
      },
    ],
    price: {
      coins: 1,
    },
    minPlayersCounts: [],
  },
  {
    id: ECardId.XENOPHON,
    type: ECardType.LEADER,
    effects: [
      {
        type: EEffect.COIN_PASSIVE,
        source: ECoinPassiveSource.COMMERCIAL_CARDS,
        count: 2,
      },
    ],
    price: {
      coins: 2,
    },
    minPlayersCounts: [],
  },
  {
    id: ECardId.VITRUVIUS,
    type: ECardType.LEADER,
    effects: [
      {
        type: EEffect.COIN_PASSIVE,
        source: ECoinPassiveSource.STRUCTURE_INHERITANCE,
        count: 2,
      },
    ],
    price: {
      coins: 1,
    },
    minPlayersCounts: [],
  },
  {
    id: ECardId.SOLOMON,
    type: ECardType.LEADER,
    effects: [
      {
        type: EEffect.BUILD_CARD,
        source: EFreeCardSource.DISCARD,
        isFree: true,
        count: 1,
        period: EFreeCardPeriod.NOW,
        possibleActions: [ECardActionType.BUILD_STRUCTURE],
        priority: 0,
      },
    ],
    price: {
      coins: 3,
    },
    minPlayersCounts: [],
  },
  {
    id: ECardId.CROESUS,
    type: ECardType.LEADER,
    effects: [
      {
        type: EEffect.GAIN,
        gain: {
          coins: 6,
        },
      },
    ],
    price: {
      coins: 1,
    },
    minPlayersCounts: [],
  },
  {
    id: ECardId.HYPATIA,
    type: ECardType.LEADER,
    effects: [
      {
        type: EEffect.CARDS_TYPE,
        gain: {
          points: 1,
        },
        cardTypes: [ECardType.SCIENTIFIC],
        directions: [EPlayerDirection.SELF],
      },
    ],
    price: {
      coins: 4,
    },
    minPlayersCounts: [],
  },
  {
    id: ECardId.NEBUCHADNEZZAR,
    type: ECardType.LEADER,
    effects: [
      {
        type: EEffect.CARDS_TYPE,
        gain: {
          points: 1,
        },
        cardTypes: [ECardType.CIVILIAN],
        directions: [EPlayerDirection.SELF],
      },
    ],
    price: {
      coins: 4,
    },
    minPlayersCounts: [],
  },
  {
    id: ECardId.PHIDIAS,
    type: ECardType.LEADER,
    effects: [
      {
        type: EEffect.CARDS_TYPE,
        gain: {
          points: 1,
        },
        cardTypes: [ECardType.RAW_MATERIAL],
        directions: [EPlayerDirection.SELF],
      },
    ],
    price: {
      coins: 3,
    },
    minPlayersCounts: [],
  },
  {
    id: ECardId.VARRO,
    type: ECardType.LEADER,
    effects: [
      {
        type: EEffect.CARDS_TYPE,
        gain: {
          points: 1,
        },
        cardTypes: [ECardType.COMMERCIAL],
        directions: [EPlayerDirection.SELF],
      },
    ],
    price: {
      coins: 3,
    },
    minPlayersCounts: [],
  },
  {
    id: ECardId.PERICLES,
    type: ECardType.LEADER,
    effects: [
      {
        type: EEffect.CARDS_TYPE,
        gain: {
          points: 2,
        },
        cardTypes: [ECardType.MILITARY],
        directions: [EPlayerDirection.SELF],
      },
    ],
    price: {
      coins: 6,
    },
    minPlayersCounts: [],
  },
  {
    id: ECardId.PRAXITELES,
    type: ECardType.LEADER,
    effects: [
      {
        type: EEffect.CARDS_TYPE,
        gain: {
          points: 2,
        },
        cardTypes: [ECardType.MANUFACTURED_GOODS],
        directions: [EPlayerDirection.SELF],
      },
    ],
    price: {
      coins: 3,
    },
    minPlayersCounts: [],
  },
  {
    id: ECardId.HIRAM,
    type: ECardType.LEADER,
    effects: [
      {
        type: EEffect.CARDS_TYPE,
        gain: {
          points: 2,
        },
        cardTypes: [ECardType.GUILD],
        directions: [EPlayerDirection.SELF],
      },
    ],
    price: {
      coins: 3,
    },
    minPlayersCounts: [],
  },
  {
    id: ECardId.SAPPHO,
    type: ECardType.LEADER,
    effects: [
      {
        type: EEffect.GAIN,
        gain: {
          points: 2,
        },
      },
    ],
    price: {
      coins: 1,
    },
    minPlayersCounts: [],
  },
  {
    id: ECardId.ZENOBIA,
    type: ECardType.LEADER,
    effects: [
      {
        type: EEffect.GAIN,
        gain: {
          points: 3,
        },
      },
    ],
    price: {
      coins: 2,
    },
    minPlayersCounts: [],
  },
  {
    id: ECardId.NEFERTITI,
    type: ECardType.LEADER,
    effects: [
      {
        type: EEffect.GAIN,
        gain: {
          points: 4,
        },
      },
    ],
    price: {
      coins: 3,
    },
    minPlayersCounts: [],
  },
  {
    id: ECardId.CLEOPATRA,
    type: ECardType.LEADER,
    effects: [
      {
        type: EEffect.GAIN,
        gain: {
          points: 5,
        },
      },
    ],
    price: {
      coins: 4,
    },
    minPlayersCounts: [],
  },
  {
    id: ECardId.ARCHIMEDES,
    type: ECardType.LEADER,
    effects: [
      {
        type: EEffect.REDUCED_PRICE,
        objectType: ECardType.SCIENTIFIC,
        direction: EPlayerDirection.SELF,
        discount: {
          resources: 1,
        },
      },
    ],
    price: {
      coins: 4,
    },
    minPlayersCounts: [],
  },
  {
    id: ECardId.LEONIDAS,
    type: ECardType.LEADER,
    effects: [
      {
        type: EEffect.REDUCED_PRICE,
        objectType: ECardType.MILITARY,
        direction: EPlayerDirection.SELF,
        discount: {
          resources: 1,
        },
      },
    ],
    price: {
      coins: 2,
    },
    minPlayersCounts: [],
  },
  {
    id: ECardId.HAMMURABI,
    type: ECardType.LEADER,
    effects: [
      {
        type: EEffect.REDUCED_PRICE,
        objectType: ECardType.CIVILIAN,
        direction: EPlayerDirection.SELF,
        discount: {
          resources: 1,
        },
      },
    ],
    price: {
      coins: 2,
    },
    minPlayersCounts: [],
  },
  {
    id: ECardId.IMHOTEP,
    type: ECardType.LEADER,
    effects: [
      {
        type: EEffect.REDUCED_PRICE,
        objectType: 'wonderLevel',
        direction: EPlayerDirection.SELF,
        discount: {
          resources: 1,
        },
      },
    ],
    price: {
      coins: 3,
    },
    minPlayersCounts: [],
  },
  {
    id: ECardId.EUCLID,
    type: ECardType.LEADER,
    effects: [
      {
        type: EEffect.SCIENTIFIC_SYMBOLS,
        variants: [EScientificSymbol.COMPASS],
      },
    ],
    price: {
      coins: 5,
    },
    minPlayersCounts: [],
  },
  {
    id: ECardId.PTOLEMY,
    type: ECardType.LEADER,
    effects: [
      {
        type: EEffect.SCIENTIFIC_SYMBOLS,
        variants: [EScientificSymbol.TABLET],
      },
    ],
    price: {
      coins: 5,
    },
    minPlayersCounts: [],
  },
  {
    id: ECardId.PYTHAGORAS,
    type: ECardType.LEADER,
    effects: [
      {
        type: EEffect.SCIENTIFIC_SYMBOLS,
        variants: [EScientificSymbol.GEAR],
      },
    ],
    price: {
      coins: 5,
    },
    minPlayersCounts: [],
  },
];

export default LEADERS;
