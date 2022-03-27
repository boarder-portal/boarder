import { ESevenWondersNeighborSide, ISevenWondersResource } from 'common/types/sevenWonders';

export type TResourceOwner = ESevenWondersNeighborSide | 'own' | 'bank';

export interface IOwnerResource extends ISevenWondersResource {
  owner: TResourceOwner;
}
