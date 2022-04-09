import {
  ESevenWonderCardId,
  ESevenWondersCardType,
  ESevenWondersPlayerDirection,
  ISevenWondersCard,
} from 'common/types/sevenWonders/cards';
import {
  ESevenWondersFreeCardPeriod,
  ESevenWondersFreeCardSource,
  ISevenWondersEffect,
} from 'common/types/sevenWonders/effects';
import { ESevenWondersCardActionType, ESevenWondersScientificSymbol } from 'common/types/sevenWonders';

const LEADERS: ISevenWondersCard[] = [
  {
    id: ESevenWonderCardId.AMYTIS,
    type: ESevenWondersCardType.LEADER,
    effects: [{
      type: ISevenWondersEffect.WONDER_LEVELS,
      gain: {
        points: 2,
      },
      directions: [ESevenWondersPlayerDirection.SELF],
    }],
    price: {
      coins: 4,
    },
    minPlayersCounts: [3],
  },
  {
    id: ESevenWonderCardId.ALEXANDER,
    type: ESevenWondersCardType.LEADER,
    effects: [{
      type: ISevenWondersEffect.WINS,
      gain: {
        points: 1,
      },
      directions: [ESevenWondersPlayerDirection.SELF],
    }],
    price: {
      coins: 3,
    },
    minPlayersCounts: [3],
  },
  {
    id: ESevenWonderCardId.JUSTINIAN,
    type: ESevenWondersCardType.LEADER,
    effects: [{
      type: ISevenWondersEffect.CARDS_TYPE,
      cardTypes: [
        ESevenWondersCardType.CIVILIAN,
        ESevenWondersCardType.MILITARY,
        ESevenWondersCardType.SCIENTIFIC,
      ],
      isCombo: true,
      gain: {
        points: 3,
      },
      directions: [ESevenWondersPlayerDirection.SELF],
    }],
    price: {
      coins: 3,
    },
    minPlayersCounts: [3],
  },
  {
    id: ESevenWonderCardId.PLATO,
    type: ESevenWondersCardType.LEADER,
    effects: [{
      type: ISevenWondersEffect.CARDS_TYPE,
      cardTypes: [
        ESevenWondersCardType.RAW_MATERIAL,
        ESevenWondersCardType.MANUFACTURED_GOODS,
        ESevenWondersCardType.CIVILIAN,
        ESevenWondersCardType.COMMERCIAL,
        ESevenWondersCardType.SCIENTIFIC,
        ESevenWondersCardType.MILITARY,
        ESevenWondersCardType.GUILD,
      ],
      isCombo: true,
      gain: {
        points: 7,
      },
      directions: [ESevenWondersPlayerDirection.SELF],
    }],
    price: {
      coins: 4,
    },
    minPlayersCounts: [3],
  },
  {
    id: ESevenWonderCardId.RAMSES,
    type: ESevenWondersCardType.LEADER,
    effects: [{
      type: ISevenWondersEffect.BUILD_CARD,
      source: ESevenWondersFreeCardSource.HAND,
      isFree: true,
      count: Infinity,
      period: ESevenWondersFreeCardPeriod.ETERNITY,
      possibleActions: [ESevenWondersCardActionType.BUILD_STRUCTURE],
    }],
    price: {
      coins: 5,
    },
    minPlayersCounts: [3],
  },
  {
    id: ESevenWonderCardId.HANNIBAL,
    type: ESevenWondersCardType.LEADER,
    effects: [{
      type: ISevenWondersEffect.SHIELDS,
      count: 1,
    }],
    price: {
      coins: 2,
    },
    minPlayersCounts: [3],
  },
  {
    id: ESevenWonderCardId.CAESAR,
    type: ESevenWondersCardType.LEADER,
    effects: [{
      type: ISevenWondersEffect.SHIELDS,
      count: 2,
    }],
    price: {
      coins: 5,
    },
    minPlayersCounts: [3],
  },
  {
    id: ESevenWonderCardId.SOLOMON,
    type: ESevenWondersCardType.LEADER,
    effects: [{
      type: ISevenWondersEffect.BUILD_CARD,
      source: ESevenWondersFreeCardSource.DISCARD,
      isFree: true,
      count: 1,
      period: ESevenWondersFreeCardPeriod.NOW,
      possibleActions: [ESevenWondersCardActionType.BUILD_STRUCTURE],
    }],
    price: {
      coins: 3,
    },
    minPlayersCounts: [3],
  },
  {
    id: ESevenWonderCardId.CROESUS,
    type: ESevenWondersCardType.LEADER,
    effects: [{
      type: ISevenWondersEffect.GAIN,
      gain: {
        coins: 6,
      },
    }],
    price: {
      coins: 1,
    },
    minPlayersCounts: [3],
  },
  {
    id: ESevenWonderCardId.HYPATIA,
    type: ESevenWondersCardType.LEADER,
    effects: [{
      type: ISevenWondersEffect.CARDS_TYPE,
      gain: {
        points: 1,
      },
      cardTypes: [ESevenWondersCardType.SCIENTIFIC],
      directions: [ESevenWondersPlayerDirection.SELF],
    }],
    price: {
      coins: 4,
    },
    minPlayersCounts: [3],
  },
  {
    id: ESevenWonderCardId.NEBUCHADNEZZAR,
    type: ESevenWondersCardType.LEADER,
    effects: [{
      type: ISevenWondersEffect.CARDS_TYPE,
      gain: {
        points: 1,
      },
      cardTypes: [ESevenWondersCardType.CIVILIAN],
      directions: [ESevenWondersPlayerDirection.SELF],
    }],
    price: {
      coins: 4,
    },
    minPlayersCounts: [3],
  },
  {
    id: ESevenWonderCardId.PHIDIAS,
    type: ESevenWondersCardType.LEADER,
    effects: [{
      type: ISevenWondersEffect.CARDS_TYPE,
      gain: {
        points: 1,
      },
      cardTypes: [ESevenWondersCardType.RAW_MATERIAL],
      directions: [ESevenWondersPlayerDirection.SELF],
    }],
    price: {
      coins: 3,
    },
    minPlayersCounts: [3],
  },
  {
    id: ESevenWonderCardId.VARRO,
    type: ESevenWondersCardType.LEADER,
    effects: [{
      type: ISevenWondersEffect.CARDS_TYPE,
      gain: {
        points: 1,
      },
      cardTypes: [ESevenWondersCardType.COMMERCIAL],
      directions: [ESevenWondersPlayerDirection.SELF],
    }],
    price: {
      coins: 3,
    },
    minPlayersCounts: [3],
  },
  {
    id: ESevenWonderCardId.PERICLES,
    type: ESevenWondersCardType.LEADER,
    effects: [{
      type: ISevenWondersEffect.CARDS_TYPE,
      gain: {
        points: 2,
      },
      cardTypes: [ESevenWondersCardType.MILITARY],
      directions: [ESevenWondersPlayerDirection.SELF],
    }],
    price: {
      coins: 6,
    },
    minPlayersCounts: [3],
  },
  {
    id: ESevenWonderCardId.PRAXITELES,
    type: ESevenWondersCardType.LEADER,
    effects: [{
      type: ISevenWondersEffect.CARDS_TYPE,
      gain: {
        points: 2,
      },
      cardTypes: [ESevenWondersCardType.MANUFACTURED_GOODS],
      directions: [ESevenWondersPlayerDirection.SELF],
    }],
    price: {
      coins: 3,
    },
    minPlayersCounts: [3],
  },
  {
    id: ESevenWonderCardId.HIRAM,
    type: ESevenWondersCardType.LEADER,
    effects: [{
      type: ISevenWondersEffect.CARDS_TYPE,
      gain: {
        points: 2,
      },
      cardTypes: [ESevenWondersCardType.GUILD],
      directions: [ESevenWondersPlayerDirection.SELF],
    }],
    price: {
      coins: 3,
    },
    minPlayersCounts: [3],
  },
  {
    id: ESevenWonderCardId.SAPPHO,
    type: ESevenWondersCardType.LEADER,
    effects: [{
      type: ISevenWondersEffect.GAIN,
      gain: {
        points: 2,
      },
    }],
    price: {
      coins: 1,
    },
    minPlayersCounts: [3],
  },
  {
    id: ESevenWonderCardId.ZENOBIA,
    type: ESevenWondersCardType.LEADER,
    effects: [{
      type: ISevenWondersEffect.GAIN,
      gain: {
        points: 3,
      },
    }],
    price: {
      coins: 2,
    },
    minPlayersCounts: [3],
  },
  {
    id: ESevenWonderCardId.NEFERTITI,
    type: ESevenWondersCardType.LEADER,
    effects: [{
      type: ISevenWondersEffect.GAIN,
      gain: {
        points: 4,
      },
    }],
    price: {
      coins: 3,
    },
    minPlayersCounts: [3],
  },
  {
    id: ESevenWonderCardId.CLEOPATRA,
    type: ESevenWondersCardType.LEADER,
    effects: [{
      type: ISevenWondersEffect.GAIN,
      gain: {
        points: 5,
      },
    }],
    price: {
      coins: 4,
    },
    minPlayersCounts: [3],
  },

  {
    id: ESevenWonderCardId.EUCLID,
    type: ESevenWondersCardType.LEADER,
    effects: [{
      type: ISevenWondersEffect.SCIENTIFIC_SYMBOLS,
      variants: [ESevenWondersScientificSymbol.COMPASS],
    }],
    price: {
      coins: 5,
    },
    minPlayersCounts: [3],
  },
  {
    id: ESevenWonderCardId.PTOLEMY,
    type: ESevenWondersCardType.LEADER,
    effects: [{
      type: ISevenWondersEffect.SCIENTIFIC_SYMBOLS,
      variants: [ESevenWondersScientificSymbol.TABLET],
    }],
    price: {
      coins: 5,
    },
    minPlayersCounts: [3],
  },
  {
    id: ESevenWonderCardId.PYTHAGORAS,
    type: ESevenWondersCardType.LEADER,
    effects: [{
      type: ISevenWondersEffect.SCIENTIFIC_SYMBOLS,
      variants: [ESevenWondersScientificSymbol.GEAR],
    }],
    price: {
      coins: 5,
    },
    minPlayersCounts: [3],
  },
];

export default LEADERS;
