import {
  ESevenWondersCardActionType,
  ESevenWondersCity,
  ESevenWondersNeighborSide,
  ESevenWondersResource,
  ESevenWondersScientificSymbol,
  ISevenWondersCity,
} from 'common/types/sevenWonders';
import {
  ESevenWondersEffect,
  ESevenWondersFreeCardPeriod,
  ESevenWondersFreeCardSource,
} from 'common/types/sevenWonders/effects';
import { ESevenWondersCardType, ESevenWondersPlayerDirection } from 'common/types/sevenWonders/cards';

const CITIES: Record<ESevenWondersCity, ISevenWondersCity> = {
  [ESevenWondersCity.RHODOS]: {
    sides: [{
      effects: [{
        type: ESevenWondersEffect.RESOURCES,
        variants: [{
          type: ESevenWondersResource.ORE,
          count: 1,
        }],
      }],
      wonders: [{
        price: {
          resources: [{
            type: ESevenWondersResource.WOOD,
            count: 2,
          }],
        },
        effects: [{
          type: ESevenWondersEffect.GAIN,
          gain: {
            points: 3,
          },
        }],
      }, {
        price: {
          resources: [{
            type: ESevenWondersResource.CLAY,
            count: 3,
          }],
        },
        effects: [{
          type: ESevenWondersEffect.SHIELDS,
          count: 2,
        }],
      }, {
        price: {
          resources: [{
            type: ESevenWondersResource.ORE,
            count: 4,
          }],
        },
        effects: [{
          type: ESevenWondersEffect.GAIN,
          gain: {
            points: 7,
          },
        }],
      }],
    }, {
      effects: [{
        type: ESevenWondersEffect.RESOURCES,
        variants: [{
          type: ESevenWondersResource.ORE,
          count: 1,
        }],
      }],
      wonders: [{
        price: {
          resources: [{
            type: ESevenWondersResource.STONE,
            count: 3,
          }],
        },
        effects: [{
          type: ESevenWondersEffect.SHIELDS,
          count: 1,
        }, {
          type: ESevenWondersEffect.GAIN,
          gain: {
            points: 3,
            coins: 3,
          },
        }],
      }, {
        price: {
          resources: [{
            type: ESevenWondersResource.ORE,
            count: 4,
          }],
        },
        effects: [{
          type: ESevenWondersEffect.SHIELDS,
          count: 1,
        }, {
          type: ESevenWondersEffect.GAIN,
          gain: {
            points: 4,
            coins: 4,
          },
        }],
      }],
    }],
  },
  [ESevenWondersCity.ALEXANDRIA]: {
    sides: [{
      effects: [{
        type: ESevenWondersEffect.RESOURCES,
        variants: [{
          type: ESevenWondersResource.GLASS,
          count: 1,
        }],
      }],
      wonders: [{
        price: {
          resources: [{
            type: ESevenWondersResource.STONE,
            count: 2,
          }],
        },
        effects: [{
          type: ESevenWondersEffect.GAIN,
          gain: {
            points: 3,
          },
        }],
      }, {
        price: {
          resources: [{
            type: ESevenWondersResource.ORE,
            count: 2,
          }],
        },
        effects: [{
          type: ESevenWondersEffect.RESOURCES,
          variants: [{
            type: ESevenWondersResource.CLAY,
            count: 1,
          }, {
            type: ESevenWondersResource.ORE,
            count: 1,
          }, {
            type: ESevenWondersResource.WOOD,
            count: 1,
          }, {
            type: ESevenWondersResource.STONE,
            count: 1,
          }],
        }],
      }, {
        price: {
          resources: [{
            type: ESevenWondersResource.GLASS,
            count: 2,
          }],
        },
        effects: [{
          type: ESevenWondersEffect.GAIN,
          gain: {
            points: 7,
          },
        }],
      }],
    }, {
      effects: [{
        type: ESevenWondersEffect.RESOURCES,
        variants: [{
          type: ESevenWondersResource.GLASS,
          count: 1,
        }],
      }],
      wonders: [{
        price: {
          resources: [{
            type: ESevenWondersResource.CLAY,
            count: 2,
          }],
        },
        effects: [{
          type: ESevenWondersEffect.RESOURCES,
          variants: [{
            type: ESevenWondersResource.WOOD,
            count: 1,
          }, {
            type: ESevenWondersResource.STONE,
            count: 1,
          }, {
            type: ESevenWondersResource.ORE,
            count: 1,
          }, {
            type: ESevenWondersResource.CLAY,
            count: 1,
          }],
        }],
      }, {
        price: {
          resources: [{
            type: ESevenWondersResource.WOOD,
            count: 2,
          }],
        },
        effects: [{
          type: ESevenWondersEffect.RESOURCES,
          variants: [{
            type: ESevenWondersResource.GLASS,
            count: 1,
          }, {
            type: ESevenWondersResource.LOOM,
            count: 1,
          }, {
            type: ESevenWondersResource.PAPYRUS,
            count: 1,
          }],
        }],
      }, {
        price: {
          resources: [{
            type: ESevenWondersResource.STONE,
            count: 3,
          }],
        },
        effects: [{
          type: ESevenWondersEffect.GAIN,
          gain: {
            points: 7,
          },
        }],
      }],
    }],
  },
  [ESevenWondersCity.EPHESOS]: {
    sides: [{
      effects: [{
        type: ESevenWondersEffect.RESOURCES,
        variants: [{
          type: ESevenWondersResource.PAPYRUS,
          count: 1,
        }],
      }],
      wonders: [{
        price: {
          resources: [{
            type: ESevenWondersResource.STONE,
            count: 2,
          }],
        },
        effects: [{
          type: ESevenWondersEffect.GAIN,
          gain: {
            points: 3,
          },
        }],
      }, {
        price: {
          resources: [{
            type: ESevenWondersResource.WOOD,
            count: 2,
          }],
        },
        effects: [{
          type: ESevenWondersEffect.GAIN,
          gain: {
            coins: 9,
          },
        }],
      }, {
        price: {
          resources: [{
            type: ESevenWondersResource.PAPYRUS,
            count: 2,
          }],
        },
        effects: [{
          type: ESevenWondersEffect.GAIN,
          gain: {
            points: 7,
          },
        }],
      }],
    }, {
      effects: [{
        type: ESevenWondersEffect.RESOURCES,
        variants: [{
          type: ESevenWondersResource.PAPYRUS,
          count: 1,
        }],
      }],
      wonders: [{
        price: {
          resources: [{
            type: ESevenWondersResource.STONE,
            count: 2,
          }],
        },
        effects: [{
          type: ESevenWondersEffect.GAIN,
          gain: {
            points: 2,
            coins: 4,
          },
        }],
      }, {
        price: {
          resources: [{
            type: ESevenWondersResource.WOOD,
            count: 2,
          }],
        },
        effects: [{
          type: ESevenWondersEffect.GAIN,
          gain: {
            points: 3,
            coins: 4,
          },
        }],
      }, {
        price: {
          resources: [{
            type: ESevenWondersResource.PAPYRUS,
            count: 1,
          }, {
            type: ESevenWondersResource.LOOM,
            count: 1,
          }, {
            type: ESevenWondersResource.GLASS,
            count: 1,
          }],
        },
        effects: [{
          type: ESevenWondersEffect.GAIN,
          gain: {
            points: 5,
            coins: 4,
          },
        }],
      }],
    }],
  },
  [ESevenWondersCity.BABYLON]: {
    sides: [{
      effects: [{
        type: ESevenWondersEffect.RESOURCES,
        variants: [{
          type: ESevenWondersResource.CLAY,
          count: 1,
        }],
      }],
      wonders: [{
        price: {
          resources: [{
            type: ESevenWondersResource.CLAY,
            count: 2,
          }],
        },
        effects: [{
          type: ESevenWondersEffect.GAIN,
          gain: {
            points: 3,
          },
        }],
      }, {
        price: {
          resources: [{
            type: ESevenWondersResource.WOOD,
            count: 3,
          }],
        },
        effects: [{
          type: ESevenWondersEffect.SCIENTIFIC_SYMBOLS,
          variants: [
            ESevenWondersScientificSymbol.TABLET,
            ESevenWondersScientificSymbol.COMPASS,
            ESevenWondersScientificSymbol.GEAR,
          ],
        }],
      }, {
        price: {
          resources: [{
            type: ESevenWondersResource.CLAY,
            count: 4,
          }],
        },
        effects: [{
          type: ESevenWondersEffect.GAIN,
          gain: {
            points: 7,
          },
        }],
      }],
    }, {
      effects: [{
        type: ESevenWondersEffect.RESOURCES,
        variants: [{
          type: ESevenWondersResource.CLAY,
          count: 1,
        }],
      }],
      wonders: [{
        price: {
          resources: [{
            type: ESevenWondersResource.LOOM,
            count: 1,
          }, {
            type: ESevenWondersResource.CLAY,
            count: 1,
          }],
        },
        effects: [{
          type: ESevenWondersEffect.GAIN,
          gain: {
            points: 3,
          },
        }],
      }, {
        price: {
          resources: [{
            type: ESevenWondersResource.GLASS,
            count: 1,
          }, {
            type: ESevenWondersResource.WOOD,
            count: 2,
          }],
        },
        effects: [{
          type: ESevenWondersEffect.BUILD_CARD,
          period: ESevenWondersFreeCardPeriod.LAST_AGE_TURN,
          count: 1,
          source: ESevenWondersFreeCardSource.HAND,
          isFree: false,
          possibleActions: [ESevenWondersCardActionType.BUILD_STRUCTURE, ESevenWondersCardActionType.BUILD_WONDER_STAGE, ESevenWondersCardActionType.DISCARD],
        }],
      }, {
        price: {
          resources: [{
            type: ESevenWondersResource.PAPYRUS,
            count: 1,
          }, {
            type: ESevenWondersResource.CLAY,
            count: 3,
          }],
        },
        effects: [{
          type: ESevenWondersEffect.SCIENTIFIC_SYMBOLS,
          variants: [
            ESevenWondersScientificSymbol.TABLET,
            ESevenWondersScientificSymbol.COMPASS,
            ESevenWondersScientificSymbol.GEAR,
          ],
        }],
      }],
    }],
  },
  [ESevenWondersCity.OLYMPIA]: {
    sides: [{
      effects: [{
        type: ESevenWondersEffect.RESOURCES,
        variants: [{
          type: ESevenWondersResource.WOOD,
          count: 1,
        }],
      }],
      wonders: [{
        price: {
          resources: [{
            type: ESevenWondersResource.WOOD,
            count: 2,
          }],
        },
        effects: [{
          type: ESevenWondersEffect.GAIN,
          gain: {
            points: 3,
          },
        }],
      }, {
        price: {
          resources: [{
            type: ESevenWondersResource.STONE,
            count: 2,
          }],
        },
        effects: [{
          type: ESevenWondersEffect.BUILD_CARD,
          period: ESevenWondersFreeCardPeriod.AGE,
          count: 1,
          cardTypes: [
            ESevenWondersCardType.RAW_MATERIAL,
            ESevenWondersCardType.MANUFACTURED_GOODS,
            ESevenWondersCardType.CIVILIAN,
            ESevenWondersCardType.COMMERCIAL,
            ESevenWondersCardType.SCIENTIFIC,
            ESevenWondersCardType.MILITARY,
            ESevenWondersCardType.GUILD,
          ],
          source: ESevenWondersFreeCardSource.HAND,
          isFree: true,
          possibleActions: [ESevenWondersCardActionType.BUILD_STRUCTURE],
        }],
      }, {
        price: {
          resources: [{
            type: ESevenWondersResource.ORE,
            count: 2,
          }],
        },
        effects: [{
          type: ESevenWondersEffect.GAIN,
          gain: {
            points: 7,
          },
        }],
      }],
    }, {
      effects: [{
        type: ESevenWondersEffect.RESOURCES,
        variants: [{
          type: ESevenWondersResource.WOOD,
          count: 1,
        }],
      }],
      wonders: [{
        price: {
          resources: [{
            type: ESevenWondersResource.WOOD,
            count: 2,
          }],
        },
        effects: [{
          type: ESevenWondersEffect.TRADE,
          sources: [
            ESevenWondersNeighborSide.LEFT,
            ESevenWondersNeighborSide.RIGHT,
          ],
          price: 1,
          resources: [ESevenWondersCardType.RAW_MATERIAL],
        }],
      }, {
        price: {
          resources: [{
            type: ESevenWondersResource.STONE,
            count: 2,
          }],
        },
        effects: [{
          type: ESevenWondersEffect.GAIN,
          gain: {
            points: 5,
          },
        }],
      }, {
        price: {
          resources: [{
            type: ESevenWondersResource.LOOM,
            count: 1,
          }, {
            type: ESevenWondersResource.ORE,
            count: 2,
          }],
        },
        effects: [{
          type: ESevenWondersEffect.COPY_CARD,
          neighbors: [
            ESevenWondersNeighborSide.LEFT,
            ESevenWondersNeighborSide.RIGHT,
          ],
          cardType: ESevenWondersCardType.GUILD,
        }],
      }],
    }],
  },
  [ESevenWondersCity.HALIKARNASSOS]: {
    sides: [{
      effects: [{
        type: ESevenWondersEffect.RESOURCES,
        variants: [{
          type: ESevenWondersResource.LOOM,
          count: 1,
        }],
      }],
      wonders: [{
        price: {
          resources: [{
            type: ESevenWondersResource.CLAY,
            count: 2,
          }],
        },
        effects: [{
          type: ESevenWondersEffect.GAIN,
          gain: {
            points: 3,
          },
        }],
      }, {
        price: {
          resources: [{
            type: ESevenWondersResource.ORE,
            count: 3,
          }],
        },
        effects: [{
          type: ESevenWondersEffect.BUILD_CARD,
          period: ESevenWondersFreeCardPeriod.NOW,
          count: 1,
          source: ESevenWondersFreeCardSource.DISCARD,
          isFree: true,
          possibleActions: [ESevenWondersCardActionType.BUILD_STRUCTURE],
          priority: 100,
        }],
      }, {
        price: {
          resources: [{
            type: ESevenWondersResource.LOOM,
            count: 2,
          }],
        },
        effects: [{
          type: ESevenWondersEffect.GAIN,
          gain: {
            points: 7,
          },
        }],
      }],
    }, {
      effects: [{
        type: ESevenWondersEffect.RESOURCES,
        variants: [{
          type: ESevenWondersResource.LOOM,
          count: 1,
        }],
      }],
      wonders: [{
        price: {
          resources: [{
            type: ESevenWondersResource.ORE,
            count: 2,
          }],
        },
        effects: [{
          type: ESevenWondersEffect.GAIN,
          gain: {
            points: 2,
          },
        }, {
          type: ESevenWondersEffect.BUILD_CARD,
          period: ESevenWondersFreeCardPeriod.NOW,
          count: 1,
          source: ESevenWondersFreeCardSource.DISCARD,
          isFree: true,
          possibleActions: [ESevenWondersCardActionType.BUILD_STRUCTURE],
          priority: 100,
        }],
      }, {
        price: {
          resources: [{
            type: ESevenWondersResource.CLAY,
            count: 3,
          }],
        },
        effects: [{
          type: ESevenWondersEffect.GAIN,
          gain: {
            points: 1,
          },
        }, {
          type: ESevenWondersEffect.BUILD_CARD,
          period: ESevenWondersFreeCardPeriod.NOW,
          count: 1,
          source: ESevenWondersFreeCardSource.DISCARD,
          isFree: true,
          possibleActions: [ESevenWondersCardActionType.BUILD_STRUCTURE],
          priority: 100,
        }],
      }, {
        price: {
          resources: [{
            type: ESevenWondersResource.GLASS,
            count: 1,
          }, {
            type: ESevenWondersResource.PAPYRUS,
            count: 1,
          }, {
            type: ESevenWondersResource.LOOM,
            count: 1,
          }],
        },
        effects: [{
          type: ESevenWondersEffect.BUILD_CARD,
          period: ESevenWondersFreeCardPeriod.NOW,
          count: 1,
          source: ESevenWondersFreeCardSource.DISCARD,
          isFree: true,
          possibleActions: [ESevenWondersCardActionType.BUILD_STRUCTURE],
          priority: 100,
        }],
      }],
    }],
  },
  [ESevenWondersCity.GIZAH]: {
    sides: [{
      effects: [{
        type: ESevenWondersEffect.RESOURCES,
        variants: [{
          type: ESevenWondersResource.STONE,
          count: 1,
        }],
      }],
      wonders: [{
        price: {
          resources: [{
            type: ESevenWondersResource.STONE,
            count: 2,
          }],
        },
        effects: [{
          type: ESevenWondersEffect.GAIN,
          gain: {
            points: 3,
          },
        }],
      }, {
        price: {
          resources: [{
            type: ESevenWondersResource.WOOD,
            count: 3,
          }],
        },
        effects: [{
          type: ESevenWondersEffect.GAIN,
          gain: {
            points: 5,
          },
        }],
      }, {
        price: {
          resources: [{
            type: ESevenWondersResource.STONE,
            count: 4,
          }],
        },
        effects: [{
          type: ESevenWondersEffect.GAIN,
          gain: {
            points: 7,
          },
        }],
      }],
    }, {
      effects: [{
        type: ESevenWondersEffect.RESOURCES,
        variants: [{
          type: ESevenWondersResource.STONE,
          count: 1,
        }],
      }],
      wonders: [{
        price: {
          resources: [{
            type: ESevenWondersResource.WOOD,
            count: 2,
          }],
        },
        effects: [{
          type: ESevenWondersEffect.GAIN,
          gain: {
            points: 3,
          },
        }],
      }, {
        price: {
          resources: [{
            type: ESevenWondersResource.STONE,
            count: 3,
          }],
        },
        effects: [{
          type: ESevenWondersEffect.GAIN,
          gain: {
            points: 5,
          },
        }],
      }, {
        price: {
          resources: [{
            type: ESevenWondersResource.CLAY,
            count: 3,
          }],
        },
        effects: [{
          type: ESevenWondersEffect.GAIN,
          gain: {
            points: 5,
          },
        }],
      }, {
        price: {
          resources: [{
            type: ESevenWondersResource.PAPYRUS,
            count: 1,
          }, {
            type: ESevenWondersResource.STONE,
            count: 4,
          }],
        },
        effects: [{
          type: ESevenWondersEffect.GAIN,
          gain: {
            points: 7,
          },
        }],
      }],
    }],
  },
  [ESevenWondersCity.ROMA]: {
    sides: [{
      effects: [{
        type: ESevenWondersEffect.BUILD_CARD,
        period: ESevenWondersFreeCardPeriod.LEADER_RECRUITMENT,
        cardTypes: [ESevenWondersCardType.LEADER],
        isFree: true,
        source: ESevenWondersFreeCardSource.LEADERS,
        possibleActions: [ESevenWondersCardActionType.BUILD_STRUCTURE],
      }],
      wonders: [{
        price: {
          resources: [{
            type: ESevenWondersResource.CLAY,
            count: 1,
          }, {
            type: ESevenWondersResource.WOOD,
            count: 1,
          }, {
            type: ESevenWondersResource.ORE,
            count: 1,
          }],
        },
        effects: [{
          type: ESevenWondersEffect.GAIN,
          gain: {
            points: 4,
          },
        }],
      }, {
        price: {
          resources: [{
            type: ESevenWondersResource.STONE,
            count: 2,
          }, {
            type: ESevenWondersResource.CLAY,
            count: 1,
          }, {
            type: ESevenWondersResource.LOOM,
            count: 1,
          }],
        },
        effects: [{
          type: ESevenWondersEffect.GAIN,
          gain: {
            points: 6,
          },
        }],
      }],
    }, {
      effects: [{
        type: ESevenWondersEffect.REDUCED_PRICE,
        objectType: ESevenWondersCardType.LEADER,
        discount: {
          coins: 1,
        },
        direction: ESevenWondersPlayerDirection.LEFT,
      }, {
        type: ESevenWondersEffect.REDUCED_PRICE,
        objectType: ESevenWondersCardType.LEADER,
        discount: {
          coins: 2,
        },
        direction: ESevenWondersPlayerDirection.SELF,
      }, {
        type: ESevenWondersEffect.REDUCED_PRICE,
        objectType: ESevenWondersCardType.LEADER,
        discount: {
          coins: 1,
        },
        direction: ESevenWondersPlayerDirection.RIGHT,
      }],
      wonders: [{
        price: {
          resources: [{
            type: ESevenWondersResource.CLAY,
            count: 1,
          }, {
            type: ESevenWondersResource.WOOD,
            count: 1,
          }],
        },
        effects: [{
          type: ESevenWondersEffect.GAIN,
          gain: {
            coins: 5,
          },
        }, {
          type: ESevenWondersEffect.DRAW_LEADERS,
          count: 4,
        }],
      }, {
        price: {
          resources: [{
            type: ESevenWondersResource.LOOM,
            count: 1,
          }, {
            type: ESevenWondersResource.STONE,
            count: 1,
          }, {
            type: ESevenWondersResource.CLAY,
            count: 1,
          }],
        },
        effects: [{
          type: ESevenWondersEffect.GAIN,
          gain: {
            points: 3,
          },
        }, {
          type: ESevenWondersEffect.BUILD_CARD,
          period: ESevenWondersFreeCardPeriod.NOW,
          cardTypes: [ESevenWondersCardType.LEADER],
          source: ESevenWondersFreeCardSource.LEADERS,
          count: 1,
          isFree: false,
          possibleActions: [ESevenWondersCardActionType.BUILD_STRUCTURE],
        }],
      }, {
        price: {
          resources: [{
            type: ESevenWondersResource.PAPYRUS,
            count: 1,
          }, {
            type: ESevenWondersResource.STONE,
            count: 2,
          }],
        },
        effects: [{
          type: ESevenWondersEffect.GAIN,
          gain: {
            points: 3,
          },
        }, {
          type: ESevenWondersEffect.BUILD_CARD,
          period: ESevenWondersFreeCardPeriod.NOW,
          cardTypes: [ESevenWondersCardType.LEADER],
          isFree: false,
          source: ESevenWondersFreeCardSource.LEADERS,
          count: 1,
          possibleActions: [ESevenWondersCardActionType.BUILD_STRUCTURE],
        }],
      }],
    }],
  },
};

export default CITIES;
