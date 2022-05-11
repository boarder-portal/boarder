import { ICard, IPlayer } from 'common/types/set';

export interface IGameInfoEvent {
  players: IPlayer[];
  cards: ICard[];
}

export interface ISendSetEvent {
  cardsIds: number[];
}
