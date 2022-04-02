import {
  ESevenWondersCardActionType,
  ESevenWondersCity,
  ESevenWondersNeighborSide,
  ESevenWondersResource,
  ESevenWondersScientificSymbol,
  ISevenWondersCity,
} from 'common/types/sevenWonders';
import {
  ESevenWondersFreeCardPeriod,
  ESevenWondersFreeCardSource,
  ISevenWondersEffect,
} from 'common/types/sevenWonders/effects';
import { ESevenWondersCardType } from 'common/types/sevenWonders/cards';

const CITIES: Record<ESevenWondersCity, ISevenWondersCity> = {
  [ESevenWondersCity.RHODOS]: {
    sides: [{
      effect: {
        type: ISevenWondersEffect.RESOURCES,
        variants: [{
          type: ESevenWondersResource.ORE,
          count: 1,
        }],
      },
      wonders: [{
        price: {
          resources: [{
            type: ESevenWondersResource.WOOD,
            count: 2,
          }],
        },
        effects: [{
          type: ISevenWondersEffect.GAIN,
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
          type: ISevenWondersEffect.SHIELDS,
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
          type: ISevenWondersEffect.GAIN,
          gain: {
            points: 7,
          },
        }],
      }],
    }, {
      effect: {
        type: ISevenWondersEffect.RESOURCES,
        variants: [{
          type: ESevenWondersResource.ORE,
          count: 1,
        }],
      },
      wonders: [{
        price: {
          resources: [{
            type: ESevenWondersResource.STONE,
            count: 3,
          }],
        },
        effects: [{
          type: ISevenWondersEffect.SHIELDS,
          count: 1,
        }, {
          type: ISevenWondersEffect.GAIN,
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
          type: ISevenWondersEffect.SHIELDS,
          count: 1,
        }, {
          type: ISevenWondersEffect.GAIN,
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
      effect: {
        type: ISevenWondersEffect.RESOURCES,
        variants: [{
          type: ESevenWondersResource.GLASS,
          count: 1,
        }],
      },
      wonders: [{
        price: {
          resources: [{
            type: ESevenWondersResource.STONE,
            count: 2,
          }],
        },
        effects: [{
          type: ISevenWondersEffect.GAIN,
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
          type: ISevenWondersEffect.RESOURCES,
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
          type: ISevenWondersEffect.GAIN,
          gain: {
            points: 7,
          },
        }],
      }],
    }, {
      effect: {
        type: ISevenWondersEffect.RESOURCES,
        variants: [{
          type: ESevenWondersResource.GLASS,
          count: 1,
        }],
      },
      wonders: [{
        price: {
          resources: [{
            type: ESevenWondersResource.CLAY,
            count: 2,
          }],
        },
        effects: [{
          type: ISevenWondersEffect.RESOURCES,
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
          type: ISevenWondersEffect.RESOURCES,
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
          type: ISevenWondersEffect.GAIN,
          gain: {
            points: 7,
          },
        }],
      }],
    }],
  },
  [ESevenWondersCity.EPHESOS]: {
    sides: [{
      effect: {
        type: ISevenWondersEffect.RESOURCES,
        variants: [{
          type: ESevenWondersResource.PAPYRUS,
          count: 1,
        }],
      },
      wonders: [{
        price: {
          resources: [{
            type: ESevenWondersResource.STONE,
            count: 2,
          }],
        },
        effects: [{
          type: ISevenWondersEffect.GAIN,
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
          type: ISevenWondersEffect.GAIN,
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
          type: ISevenWondersEffect.GAIN,
          gain: {
            points: 7,
          },
        }],
      }],
    }, {
      effect: {
        type: ISevenWondersEffect.RESOURCES,
        variants: [{
          type: ESevenWondersResource.PAPYRUS,
          count: 1,
        }],
      },
      wonders: [{
        price: {
          resources: [{
            type: ESevenWondersResource.STONE,
            count: 2,
          }],
        },
        effects: [{
          type: ISevenWondersEffect.GAIN,
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
          type: ISevenWondersEffect.GAIN,
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
          type: ISevenWondersEffect.GAIN,
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
      effect: {
        type: ISevenWondersEffect.RESOURCES,
        variants: [{
          type: ESevenWondersResource.CLAY,
          count: 1,
        }],
      },
      wonders: [{
        price: {
          resources: [{
            type: ESevenWondersResource.CLAY,
            count: 2,
          }],
        },
        effects: [{
          type: ISevenWondersEffect.GAIN,
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
          type: ISevenWondersEffect.SCIENTIFIC_SYMBOLS,
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
          type: ISevenWondersEffect.GAIN,
          gain: {
            points: 7,
          },
        }],
      }],
    }, {
      effect: {
        type: ISevenWondersEffect.RESOURCES,
        variants: [{
          type: ESevenWondersResource.CLAY,
          count: 1,
        }],
      },
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
          type: ISevenWondersEffect.GAIN,
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
          type: ISevenWondersEffect.BUILD_CARD,
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
          type: ISevenWondersEffect.SCIENTIFIC_SYMBOLS,
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
      effect: {
        type: ISevenWondersEffect.RESOURCES,
        variants: [{
          type: ESevenWondersResource.WOOD,
          count: 1,
        }],
      },
      wonders: [{
        price: {
          resources: [{
            type: ESevenWondersResource.WOOD,
            count: 2,
          }],
        },
        effects: [{
          type: ISevenWondersEffect.GAIN,
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
          type: ISevenWondersEffect.BUILD_CARD,
          period: ESevenWondersFreeCardPeriod.AGE,
          count: 1,
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
          type: ISevenWondersEffect.GAIN,
          gain: {
            points: 7,
          },
        }],
      }],
    }, {
      effect: {
        type: ISevenWondersEffect.RESOURCES,
        variants: [{
          type: ESevenWondersResource.WOOD,
          count: 1,
        }],
      },
      wonders: [{
        price: {
          resources: [{
            type: ESevenWondersResource.WOOD,
            count: 2,
          }],
        },
        effects: [{
          type: ISevenWondersEffect.TRADE,
          neighbors: [
            ESevenWondersNeighborSide.LEFT,
            ESevenWondersNeighborSide.RIGHT,
          ],
          price: 1,
          resource: ESevenWondersCardType.RAW_MATERIAL,
        }],
      }, {
        price: {
          resources: [{
            type: ESevenWondersResource.STONE,
            count: 2,
          }],
        },
        effects: [{
          type: ISevenWondersEffect.GAIN,
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
          type: ISevenWondersEffect.COPY_CARD,
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
      effect: {
        type: ISevenWondersEffect.RESOURCES,
        variants: [{
          type: ESevenWondersResource.LOOM,
          count: 1,
        }],
      },
      wonders: [{
        price: {
          resources: [{
            type: ESevenWondersResource.CLAY,
            count: 2,
          }],
        },
        effects: [{
          type: ISevenWondersEffect.GAIN,
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
          type: ISevenWondersEffect.BUILD_CARD,
          period: ESevenWondersFreeCardPeriod.NOW,
          count: 1,
          source: ESevenWondersFreeCardSource.DISCARD,
          isFree: true,
          possibleActions: [ESevenWondersCardActionType.BUILD_STRUCTURE],
        }],
      }, {
        price: {
          resources: [{
            type: ESevenWondersResource.LOOM,
            count: 2,
          }],
        },
        effects: [{
          type: ISevenWondersEffect.GAIN,
          gain: {
            points: 7,
          },
        }],
      }],
    }, {
      effect: {
        type: ISevenWondersEffect.RESOURCES,
        variants: [{
          type: ESevenWondersResource.LOOM,
          count: 1,
        }],
      },
      wonders: [{
        price: {
          resources: [{
            type: ESevenWondersResource.ORE,
            count: 2,
          }],
        },
        effects: [{
          type: ISevenWondersEffect.GAIN,
          gain: {
            points: 2,
          },
        }, {
          type: ISevenWondersEffect.BUILD_CARD,
          period: ESevenWondersFreeCardPeriod.NOW,
          count: 1,
          source: ESevenWondersFreeCardSource.DISCARD,
          isFree: true,
          possibleActions: [ESevenWondersCardActionType.BUILD_STRUCTURE],
        }],
      }, {
        price: {
          resources: [{
            type: ESevenWondersResource.CLAY,
            count: 3,
          }],
        },
        effects: [{
          type: ISevenWondersEffect.GAIN,
          gain: {
            points: 1,
          },
        }, {
          type: ISevenWondersEffect.BUILD_CARD,
          period: ESevenWondersFreeCardPeriod.NOW,
          count: 1,
          source: ESevenWondersFreeCardSource.DISCARD,
          isFree: true,
          possibleActions: [ESevenWondersCardActionType.BUILD_STRUCTURE],
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
          type: ISevenWondersEffect.BUILD_CARD,
          period: ESevenWondersFreeCardPeriod.NOW,
          count: 1,
          source: ESevenWondersFreeCardSource.DISCARD,
          isFree: true,
          possibleActions: [ESevenWondersCardActionType.BUILD_STRUCTURE],
        }],
      }],
    }],
  },
  [ESevenWondersCity.GIZAH]: {
    sides: [{
      effect: {
        type: ISevenWondersEffect.RESOURCES,
        variants: [{
          type: ESevenWondersResource.STONE,
          count: 1,
        }],
      },
      wonders: [{
        price: {
          resources: [{
            type: ESevenWondersResource.STONE,
            count: 2,
          }],
        },
        effects: [{
          type: ISevenWondersEffect.GAIN,
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
          type: ISevenWondersEffect.GAIN,
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
          type: ISevenWondersEffect.GAIN,
          gain: {
            points: 7,
          },
        }],
      }],
    }, {
      effect: {
        type: ISevenWondersEffect.RESOURCES,
        variants: [{
          type: ESevenWondersResource.STONE,
          count: 1,
        }],
      },
      wonders: [{
        price: {
          resources: [{
            type: ESevenWondersResource.WOOD,
            count: 2,
          }],
        },
        effects: [{
          type: ISevenWondersEffect.GAIN,
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
          type: ISevenWondersEffect.GAIN,
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
          type: ISevenWondersEffect.GAIN,
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
          type: ISevenWondersEffect.GAIN,
          gain: {
            points: 7,
          },
        }],
      }],
    }],
  },

};

export default CITIES;
