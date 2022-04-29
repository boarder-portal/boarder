export interface ICard {
  suit: ESuit;
  value: EValue;
}

export enum ESuit {
  HEARTS = 'HEARTS',
  SPADES = 'SPADES',
  CLUBS = 'CLUBS',
  DIAMONDS = 'DIAMONDS',
}

export enum EValue {
  DEUCE = '2',
  THREE = '3',
  FOUR = '4',
  FIVE = '5',
  SIX = '6',
  SEVEN = '7',
  EIGHT = '8',
  NINE = '9',
  TEN = 'T',
  JACK = 'J',
  QUEEN = 'Q',
  KING = 'K',
  ACE = 'A',
}
