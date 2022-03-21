import { ESevenWondersCity, ESevenWondersResource, ISevenWondersCity } from 'common/types/sevenWonders';
import { ISevenWondersEffect } from 'common/types/sevenWonders/effects';

// TODO: fill in wonders
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
      wonders: [],
    }, {
      effect: {
        type: ISevenWondersEffect.RESOURCES,
        variants: [{
          type: ESevenWondersResource.ORE,
          count: 1,
        }],
      },
      wonders: [],
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
      wonders: [],
    }, {
      effect: {
        type: ISevenWondersEffect.RESOURCES,
        variants: [{
          type: ESevenWondersResource.GLASS,
          count: 1,
        }],
      },
      wonders: [],
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
      wonders: [],
    }, {
      effect: {
        type: ISevenWondersEffect.RESOURCES,
        variants: [{
          type: ESevenWondersResource.PAPYRUS,
          count: 1,
        }],
      },
      wonders: [],
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
      wonders: [],
    }, {
      effect: {
        type: ISevenWondersEffect.RESOURCES,
        variants: [{
          type: ESevenWondersResource.CLAY,
          count: 1,
        }],
      },
      wonders: [],
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
      wonders: [],
    }, {
      effect: {
        type: ISevenWondersEffect.RESOURCES,
        variants: [{
          type: ESevenWondersResource.WOOD,
          count: 1,
        }],
      },
      wonders: [],
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
      wonders: [],
    }, {
      effect: {
        type: ISevenWondersEffect.RESOURCES,
        variants: [{
          type: ESevenWondersResource.LOOM,
          count: 1,
        }],
      },
      wonders: [],
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
      wonders: [],
    }, {
      effect: {
        type: ISevenWondersEffect.RESOURCES,
        variants: [{
          type: ESevenWondersResource.STONE,
          count: 1,
        }],
      },
      wonders: [],
    }],
  },

};

export default CITIES;
