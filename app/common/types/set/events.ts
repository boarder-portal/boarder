import { ISetCard, ISetPlayer } from 'common/types/set/index';

export interface ISetGameInfoEvent {
  players: ISetPlayer[];
  cards: ISetCard[];
}

export interface ISetSendSetEvent {
  cardsIds: number[];
}
