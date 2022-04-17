import { ECardActionType, IGameOptions } from 'common/types/sevenWonders';

export { default as CARDS_BY_AGE } from './cards';
export { default as ALL_CITIES } from './cities';
export { default as ALL_LEADERS } from './leaders';

export const DEFAULT_GAME_OPTIONS: IGameOptions = {
  playersCount: 3,
};

export const DEFAULT_CARD_ACTIONS = Object.values(ECardActionType);
