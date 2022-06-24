import { IGameOptions } from 'common/types/mahjong';

export * from './impliedFans';
export * from './tiles';

export const DEFAULT_GAME_OPTIONS: IGameOptions = {
  minPlayersCount: 4,
  maxPlayersCount: 4,
};
