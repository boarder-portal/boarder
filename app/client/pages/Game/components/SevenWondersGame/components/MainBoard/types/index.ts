import { Action, Payments, Resource, ResourceOwner } from 'common/types/games/sevenWonders';

export interface OwnerResource extends Resource {
  owner: ResourceOwner;
}

export interface CourtesansBuildInfo {
  cardIndex: number;
  action: Action;
  payments?: Payments;
}
