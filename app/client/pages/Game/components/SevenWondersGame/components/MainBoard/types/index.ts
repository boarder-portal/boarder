import {
  IResource,
  TAction,
  TPayments,
  TResourceOwner,
} from 'common/types/sevenWonders';

export interface IOwnerResource extends IResource {
  owner: TResourceOwner;
}

export interface ISevenWondersCourtesansBuildInfo {
  cardIndex: number;
  action: TAction;
  payments?: TPayments
}
