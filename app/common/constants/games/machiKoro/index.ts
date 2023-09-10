import { Card, CardColor, CardId, CardType, GameOptions, LandmarkCard, LandmarkId } from 'common/types/machiKoro';

export const DEFAULT_GAME_OPTIONS: GameOptions = {
  minPlayersCount: 1,
  maxPlayersCount: 5,
};

export const ALL_CARDS: Card[] = [
  // red
  {
    id: CardId.CAFE,
    color: CardColor.RED,
    type: CardType.RESTAURANT,
    cost: 2,
    dice: [3],
    count: 6,
  },
  {
    id: CardId.RESTAURANT,
    color: CardColor.RED,
    type: CardType.RESTAURANT,
    cost: 3,
    dice: [9, 10],
    count: 6,
  },
  {
    id: CardId.SUSHI_BAR,
    color: CardColor.RED,
    type: CardType.RESTAURANT,
    cost: 2,
    dice: [1],
    count: 6,
  },
  {
    id: CardId.PIZZA_JOINT,
    color: CardColor.RED,
    type: CardType.RESTAURANT,
    cost: 1,
    dice: [7],
    count: 6,
  },
  {
    id: CardId.HAMBURGER_STAND,
    color: CardColor.RED,
    type: CardType.RESTAURANT,
    cost: 1,
    dice: [8],
    count: 6,
  },

  // green
  {
    id: CardId.BAKERY,
    color: CardColor.GREEN,
    type: CardType.SHOP,
    cost: 1,
    dice: [2, 3],
    count: 6,
  },
  {
    id: CardId.CONVENIENCE_STORE,
    color: CardColor.GREEN,
    type: CardType.SHOP,
    cost: 2,
    dice: [4],
    count: 6,
  },
  {
    id: CardId.CHEESE_FACTORY,
    color: CardColor.GREEN,
    type: CardType.FACTORY,
    cost: 5,
    dice: [7],
    count: 6,
  },
  {
    id: CardId.FURNITURE_FACTORY,
    color: CardColor.GREEN,
    type: CardType.FACTORY,
    cost: 3,
    dice: [8],
    count: 6,
  },
  {
    id: CardId.PRODUCE_MARKET,
    color: CardColor.GREEN,
    type: CardType.MARKET,
    cost: 2,
    dice: [11, 12],
    count: 6,
  },
  {
    id: CardId.FLOWER_SHOP,
    color: CardColor.GREEN,
    type: CardType.SHOP,
    cost: 1,
    dice: [6],
    count: 6,
  },
  {
    id: CardId.FOOD_WAREHOUSE,
    color: CardColor.GREEN,
    type: CardType.FACTORY,
    cost: 2,
    dice: [12, 13],
    count: 6,
  },

  // blue
  {
    id: CardId.WHEAT_FIELD,
    color: CardColor.BLUE,
    type: CardType.WHEAT,
    cost: 1,
    dice: [1],
    count: 6,
  },
  {
    id: CardId.LIVESTOCK_FARM,
    color: CardColor.BLUE,
    type: CardType.FARM,
    cost: 1,
    dice: [2],
    count: 6,
  },
  {
    id: CardId.FOREST,
    color: CardColor.BLUE,
    type: CardType.GEAR,
    cost: 3,
    dice: [5],
    count: 6,
  },
  {
    id: CardId.MINE,
    color: CardColor.BLUE,
    type: CardType.GEAR,
    cost: 6,
    dice: [9],
    count: 6,
  },
  {
    id: CardId.APPLE_ORCHARD,
    color: CardColor.BLUE,
    type: CardType.WHEAT,
    cost: 3,
    dice: [10],
    count: 6,
  },
  {
    id: CardId.FLOWER_GARDEN,
    color: CardColor.BLUE,
    type: CardType.WHEAT,
    cost: 2,
    dice: [4],
    count: 6,
  },
  {
    id: CardId.MACKEREL_BOAT,
    color: CardColor.BLUE,
    type: CardType.BOAT,
    cost: 2,
    dice: [8],
    count: 6,
  },
  {
    id: CardId.TUNA_BOAT,
    color: CardColor.BLUE,
    type: CardType.BOAT,
    cost: 5,
    dice: [12, 13, 14],
    count: 6,
  },

  // purple
  {
    id: CardId.STADIUM,
    color: CardColor.PURPLE,
    type: CardType.MAJOR,
    cost: 6,
    dice: [6],
    count: 5,
  },
  {
    id: CardId.TV_STATION,
    color: CardColor.PURPLE,
    type: CardType.MAJOR,
    cost: 7,
    dice: [6],
    count: 5,
  },
  {
    id: CardId.BUSINESS_COMPLEX,
    color: CardColor.PURPLE,
    type: CardType.MAJOR,
    cost: 8,
    dice: [6],
    count: 5,
  },
  {
    id: CardId.PUBLISHER,
    color: CardColor.PURPLE,
    type: CardType.MAJOR,
    cost: 5,
    dice: [7],
    count: 5,
  },
  {
    id: CardId.TAX_OFFICE,
    color: CardColor.PURPLE,
    type: CardType.MAJOR,
    cost: 4,
    dice: [8, 9],
    count: 5,
  },
];

export const ALL_LANDMARK_CARDS: LandmarkCard[] = [
  {
    id: LandmarkId.CITY_HALL,
    cost: 0,
  },
  {
    id: LandmarkId.HARBOR,
    cost: 2,
  },
  {
    id: LandmarkId.TRAIN_STATION,
    cost: 4,
  },
  {
    id: LandmarkId.SHOPPING_MALL,
    cost: 10,
  },
  {
    id: LandmarkId.AMUSEMENT_PARK,
    cost: 16,
  },
  {
    id: LandmarkId.RADIO_TOWER,
    cost: 22,
  },
  {
    id: LandmarkId.AIRPORT,
    cost: 30,
  },
];
