import { CardActionType, PlayerDirection, ScientificSymbolType } from 'common/types/games/sevenWonders';
import { Card, CardId, CardType } from 'common/types/games/sevenWonders/cards';
import {
  CoinPassiveSourceType,
  EffectType,
  FreeCardPeriodType,
  FreeCardSourceType,
} from 'common/types/games/sevenWonders/effects';

const LEADERS: Card[] = [
  {
    id: CardId.AMYTIS,
    type: CardType.LEADER,
    effects: [
      {
        type: EffectType.WONDER_LEVELS,
        gain: {
          points: 2,
        },
        directions: [PlayerDirection.SELF],
      },
    ],
    price: {
      coins: 4,
    },
    minPlayersCounts: [],
  },
  {
    id: CardId.MIDAS,
    type: CardType.LEADER,
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
      coins: 3,
    },
    minPlayersCounts: [],
  },
  {
    id: CardId.ALEXANDER,
    type: CardType.LEADER,
    effects: [
      {
        type: EffectType.WINS,
        gain: {
          points: 1,
        },
        directions: [PlayerDirection.SELF],
      },
    ],
    price: {
      coins: 3,
    },
    minPlayersCounts: [],
  },
  {
    id: CardId.BILKIS,
    type: CardType.LEADER,
    effects: [
      {
        type: EffectType.TRADE,
        price: 1,
        resources: [CardType.RAW_MATERIAL, CardType.MANUFACTURED_GOODS],
        sources: ['bank'],
      },
    ],
    price: {
      coins: 4,
    },
    minPlayersCounts: [],
  },
  {
    id: CardId.ARISTOTLE,
    type: CardType.LEADER,
    effects: [
      {
        type: EffectType.SCIENTIFIC_SET,
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
    id: CardId.MAECENAS,
    type: CardType.LEADER,
    effects: [
      {
        type: EffectType.BUILD_CARD,
        source: FreeCardSourceType.LEADERS,
        cardTypes: [CardType.LEADER],
        isFree: true,
        period: FreeCardPeriodType.LEADER_RECRUITMENT,
        possibleActions: [CardActionType.BUILD_STRUCTURE],
      },
    ],
    price: {
      coins: 1,
    },
    minPlayersCounts: [],
  },
  {
    id: CardId.JUSTINIAN,
    type: CardType.LEADER,
    effects: [
      {
        type: EffectType.CARDS_TYPE,
        cardTypes: [CardType.CIVILIAN, CardType.MILITARY, CardType.SCIENTIFIC],
        gain: {
          points: 3,
        },
        directions: [PlayerDirection.SELF],
      },
    ],
    price: {
      coins: 3,
    },
    minPlayersCounts: [],
  },
  {
    id: CardId.PLATO,
    type: CardType.LEADER,
    effects: [
      {
        type: EffectType.CARDS_TYPE,
        cardTypes: [
          CardType.RAW_MATERIAL,
          CardType.MANUFACTURED_GOODS,
          CardType.CIVILIAN,
          CardType.COMMERCIAL,
          CardType.SCIENTIFIC,
          CardType.MILITARY,
          CardType.GUILD,
        ],
        gain: {
          points: 7,
        },
        directions: [PlayerDirection.SELF],
      },
    ],
    price: {
      coins: 4,
    },
    minPlayersCounts: [],
  },
  {
    id: CardId.RAMSES,
    type: CardType.LEADER,
    effects: [
      {
        type: EffectType.BUILD_CARD,
        source: FreeCardSourceType.HAND,
        cardTypes: [CardType.GUILD],
        isFree: true,
        period: FreeCardPeriodType.ETERNITY,
        possibleActions: [CardActionType.BUILD_STRUCTURE],
      },
    ],
    price: {
      coins: 5,
    },
    minPlayersCounts: [],
  },
  {
    id: CardId.TOMYRIS,
    type: CardType.LEADER,
    effects: [
      {
        type: EffectType.RETURN_DEFEATS,
      },
    ],
    price: {
      coins: 4,
    },
    minPlayersCounts: [],
  },
  {
    id: CardId.HANNIBAL,
    type: CardType.LEADER,
    effects: [
      {
        type: EffectType.SHIELDS,
        count: 1,
      },
    ],
    price: {
      coins: 2,
    },
    minPlayersCounts: [],
  },
  {
    id: CardId.CAESAR,
    type: CardType.LEADER,
    effects: [
      {
        type: EffectType.SHIELDS,
        count: 2,
      },
    ],
    price: {
      coins: 5,
    },
    minPlayersCounts: [],
  },
  {
    id: CardId.NERO,
    type: CardType.LEADER,
    effects: [
      {
        type: EffectType.COIN_PASSIVE,
        source: CoinPassiveSourceType.VICTORY_TOKENS,
        count: 2,
      },
    ],
    price: {
      coins: 1,
    },
    minPlayersCounts: [],
  },
  {
    id: CardId.XENOPHON,
    type: CardType.LEADER,
    effects: [
      {
        type: EffectType.COIN_PASSIVE,
        source: CoinPassiveSourceType.COMMERCIAL_CARDS,
        count: 2,
      },
    ],
    price: {
      coins: 2,
    },
    minPlayersCounts: [],
  },
  {
    id: CardId.VITRUVIUS,
    type: CardType.LEADER,
    effects: [
      {
        type: EffectType.COIN_PASSIVE,
        source: CoinPassiveSourceType.STRUCTURE_INHERITANCE,
        count: 2,
      },
    ],
    price: {
      coins: 1,
    },
    minPlayersCounts: [],
  },
  {
    id: CardId.SOLOMON,
    type: CardType.LEADER,
    effects: [
      {
        type: EffectType.BUILD_CARD,
        source: FreeCardSourceType.DISCARD,
        isFree: true,
        count: 1,
        period: FreeCardPeriodType.NOW,
        possibleActions: [CardActionType.BUILD_STRUCTURE],
        priority: 0,
      },
    ],
    price: {
      coins: 3,
    },
    minPlayersCounts: [],
  },
  {
    id: CardId.CROESUS,
    type: CardType.LEADER,
    effects: [
      {
        type: EffectType.GAIN,
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
    id: CardId.HYPATIA,
    type: CardType.LEADER,
    effects: [
      {
        type: EffectType.CARDS_TYPE,
        gain: {
          points: 1,
        },
        cardTypes: [CardType.SCIENTIFIC],
        directions: [PlayerDirection.SELF],
      },
    ],
    price: {
      coins: 4,
    },
    minPlayersCounts: [],
  },
  {
    id: CardId.NEBUCHADNEZZAR,
    type: CardType.LEADER,
    effects: [
      {
        type: EffectType.CARDS_TYPE,
        gain: {
          points: 1,
        },
        cardTypes: [CardType.CIVILIAN],
        directions: [PlayerDirection.SELF],
      },
    ],
    price: {
      coins: 4,
    },
    minPlayersCounts: [],
  },
  {
    id: CardId.PHIDIAS,
    type: CardType.LEADER,
    effects: [
      {
        type: EffectType.CARDS_TYPE,
        gain: {
          points: 1,
        },
        cardTypes: [CardType.RAW_MATERIAL],
        directions: [PlayerDirection.SELF],
      },
    ],
    price: {
      coins: 3,
    },
    minPlayersCounts: [],
  },
  {
    id: CardId.VARRO,
    type: CardType.LEADER,
    effects: [
      {
        type: EffectType.CARDS_TYPE,
        gain: {
          points: 1,
        },
        cardTypes: [CardType.COMMERCIAL],
        directions: [PlayerDirection.SELF],
      },
    ],
    price: {
      coins: 3,
    },
    minPlayersCounts: [],
  },
  {
    id: CardId.PERICLES,
    type: CardType.LEADER,
    effects: [
      {
        type: EffectType.CARDS_TYPE,
        gain: {
          points: 2,
        },
        cardTypes: [CardType.MILITARY],
        directions: [PlayerDirection.SELF],
      },
    ],
    price: {
      coins: 6,
    },
    minPlayersCounts: [],
  },
  {
    id: CardId.PRAXITELES,
    type: CardType.LEADER,
    effects: [
      {
        type: EffectType.CARDS_TYPE,
        gain: {
          points: 2,
        },
        cardTypes: [CardType.MANUFACTURED_GOODS],
        directions: [PlayerDirection.SELF],
      },
    ],
    price: {
      coins: 3,
    },
    minPlayersCounts: [],
  },
  {
    id: CardId.HIRAM,
    type: CardType.LEADER,
    effects: [
      {
        type: EffectType.CARDS_TYPE,
        gain: {
          points: 2,
        },
        cardTypes: [CardType.GUILD],
        directions: [PlayerDirection.SELF],
      },
    ],
    price: {
      coins: 3,
    },
    minPlayersCounts: [],
  },
  {
    id: CardId.SAPPHO,
    type: CardType.LEADER,
    effects: [
      {
        type: EffectType.GAIN,
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
    id: CardId.ZENOBIA,
    type: CardType.LEADER,
    effects: [
      {
        type: EffectType.GAIN,
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
    id: CardId.NEFERTITI,
    type: CardType.LEADER,
    effects: [
      {
        type: EffectType.GAIN,
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
    id: CardId.CLEOPATRA,
    type: CardType.LEADER,
    effects: [
      {
        type: EffectType.GAIN,
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
    id: CardId.ARCHIMEDES,
    type: CardType.LEADER,
    effects: [
      {
        type: EffectType.REDUCED_PRICE,
        objectType: CardType.SCIENTIFIC,
        direction: PlayerDirection.SELF,
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
    id: CardId.LEONIDAS,
    type: CardType.LEADER,
    effects: [
      {
        type: EffectType.REDUCED_PRICE,
        objectType: CardType.MILITARY,
        direction: PlayerDirection.SELF,
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
    id: CardId.HAMMURABI,
    type: CardType.LEADER,
    effects: [
      {
        type: EffectType.REDUCED_PRICE,
        objectType: CardType.CIVILIAN,
        direction: PlayerDirection.SELF,
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
    id: CardId.IMHOTEP,
    type: CardType.LEADER,
    effects: [
      {
        type: EffectType.REDUCED_PRICE,
        objectType: 'wonderLevel',
        direction: PlayerDirection.SELF,
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
    id: CardId.EUCLID,
    type: CardType.LEADER,
    effects: [
      {
        type: EffectType.SCIENTIFIC_SYMBOLS,
        variants: [ScientificSymbolType.COMPASS],
      },
    ],
    price: {
      coins: 5,
    },
    minPlayersCounts: [],
  },
  {
    id: CardId.PTOLEMY,
    type: CardType.LEADER,
    effects: [
      {
        type: EffectType.SCIENTIFIC_SYMBOLS,
        variants: [ScientificSymbolType.TABLET],
      },
    ],
    price: {
      coins: 5,
    },
    minPlayersCounts: [],
  },
  {
    id: CardId.PYTHAGORAS,
    type: CardType.LEADER,
    effects: [
      {
        type: EffectType.SCIENTIFIC_SYMBOLS,
        variants: [ScientificSymbolType.GEAR],
      },
    ],
    price: {
      coins: 5,
    },
    minPlayersCounts: [],
  },
];

export default LEADERS;
