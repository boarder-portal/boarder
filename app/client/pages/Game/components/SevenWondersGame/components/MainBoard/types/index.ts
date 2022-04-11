import {
  ISevenWondersResource,
  TSevenWondersAction,
  TSevenWondersPayments,
  TSevenWondersResourceOwner,
} from 'common/types/sevenWonders';

export interface IOwnerResource extends ISevenWondersResource {
  owner: TSevenWondersResourceOwner;
}

export interface ISevenWondersCourtesansBuildInfo {
  cardIndex: number;
  action: TSevenWondersAction;
  payments?: TSevenWondersPayments
}
