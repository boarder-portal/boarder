import {
  ECardColor,
  ECardId,
  ECardType,
  ELandmarkId,
  ICard,
  IGameOptions,
  ILandmarkCard,
} from 'common/types/machiKoro';

export const DEFAULT_GAME_OPTIONS: IGameOptions = {
  minPlayersCount: 1,
  maxPlayersCount: 5,
};

export const ALL_CARDS: ICard[] = [
  // red
  {
    id: ECardId.CAFE,
    color: ECardColor.RED,
    type: ECardType.RESTAURANT,
    cost: 2,
    dice: [3],
    count: 6,
  },
  {
    id: ECardId.RESTAURANT,
    color: ECardColor.RED,
    type: ECardType.RESTAURANT,
    cost: 3,
    dice: [9, 10],
    count: 6,
  },

  // green
  {
    id: ECardId.BAKERY,
    color: ECardColor.GREEN,
    type: ECardType.SHOP,
    cost: 1,
    dice: [2, 3],
    count: 6,
  },
  {
    id: ECardId.CONVENIENCE_STORE,
    color: ECardColor.GREEN,
    type: ECardType.SHOP,
    cost: 2,
    dice: [4],
    count: 6,
  },
  {
    id: ECardId.CHEESE_FACTORY,
    color: ECardColor.GREEN,
    type: ECardType.FACTORY,
    cost: 5,
    dice: [7],
    count: 6,
  },
  {
    id: ECardId.FURNITURE_FACTORY,
    color: ECardColor.GREEN,
    type: ECardType.FACTORY,
    cost: 3,
    dice: [8],
    count: 6,
  },
  {
    id: ECardId.PRODUCE_MARKET,
    color: ECardColor.GREEN,
    type: ECardType.MARKET,
    cost: 2,
    dice: [11, 12],
    count: 6,
  },

  // blue
  {
    id: ECardId.WHEAT_FIELD,
    color: ECardColor.BLUE,
    type: ECardType.WHEAT,
    cost: 1,
    dice: [1],
    count: 6,
  },
  {
    id: ECardId.LIVESTOCK_FARM,
    color: ECardColor.BLUE,
    type: ECardType.FARM,
    cost: 1,
    dice: [2],
    count: 6,
  },
  {
    id: ECardId.FOREST,
    color: ECardColor.BLUE,
    type: ECardType.GEAR,
    cost: 3,
    dice: [5],
    count: 6,
  },
  {
    id: ECardId.MINE,
    color: ECardColor.BLUE,
    type: ECardType.GEAR,
    cost: 6,
    dice: [9],
    count: 6,
  },
  {
    id: ECardId.APPLE_ORCHARD,
    color: ECardColor.BLUE,
    type: ECardType.WHEAT,
    cost: 3,
    dice: [10],
    count: 6,
  },

  // purple
  {
    id: ECardId.STADIUM,
    color: ECardColor.PURPLE,
    type: ECardType.MAJOR,
    cost: 6,
    dice: [6],
    count: 5,
  },
  {
    id: ECardId.TV_STATION,
    color: ECardColor.PURPLE,
    type: ECardType.MAJOR,
    cost: 7,
    dice: [6],
    count: 5,
  },
  {
    id: ECardId.BUSINESS_COMPLEX,
    color: ECardColor.PURPLE,
    type: ECardType.MAJOR,
    cost: 8,
    dice: [6],
    count: 5,
  },
];

export const ALL_LANDMARK_CARDS: ILandmarkCard[] = [
  {
    id: ELandmarkId.TRAIN_STATION,
    cost: 4,
  },
  {
    id: ELandmarkId.SHOPPING_MOL,
    cost: 10,
  },
  {
    id: ELandmarkId.AMUSEMENT_PARK,
    cost: 16,
  },
  {
    id: ELandmarkId.RADIO_TOWER,
    cost: 22,
  },
];
