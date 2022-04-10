import { ESevenWondersResource, ISevenWondersResource } from 'common/types/sevenWonders';

export const ANY_RAW_RESOURCE_VARIANT: ISevenWondersResource[] = [{
  type: ESevenWondersResource.WOOD,
  count: 1,
}, {
  type: ESevenWondersResource.ORE,
  count: 1,
}, {
  type: ESevenWondersResource.CLAY,
  count: 1,
}, {
  type: ESevenWondersResource.STONE,
  count: 1,
}];

export const ANY_MANUFACTURED_GOOD_RESOURCE_VARIANT: ISevenWondersResource[] = [{
  type: ESevenWondersResource.GLASS,
  count: 1,
}, {
  type: ESevenWondersResource.LOOM,
  count: 1,
}, {
  type: ESevenWondersResource.PAPYRUS,
  count: 1,
}];
