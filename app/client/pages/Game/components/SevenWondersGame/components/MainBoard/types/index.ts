import { ISevenWondersResource, TSevenWondersResourceOwner } from 'common/types/sevenWonders';

export interface IOwnerResource extends ISevenWondersResource {
  owner: TSevenWondersResourceOwner;
}
