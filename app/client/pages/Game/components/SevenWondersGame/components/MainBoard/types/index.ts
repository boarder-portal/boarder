import { ISevenWondersPlayer, ISevenWondersResource } from 'common/types/sevenWonders';

export interface IOwnerResource extends ISevenWondersResource {
  owner: ISevenWondersPlayer;
}
