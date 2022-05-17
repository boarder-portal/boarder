import { EResource, IResource } from 'common/types/sevenWonders';

export const ANY_RAW_RESOURCE_VARIANT: IResource[] = [
  {
    type: EResource.WOOD,
    count: 1,
  },
  {
    type: EResource.ORE,
    count: 1,
  },
  {
    type: EResource.CLAY,
    count: 1,
  },
  {
    type: EResource.STONE,
    count: 1,
  },
];

export const ANY_MANUFACTURED_GOOD_RESOURCE_VARIANT: IResource[] = [
  {
    type: EResource.GLASS,
    count: 1,
  },
  {
    type: EResource.LOOM,
    count: 1,
  },
  {
    type: EResource.PAPYRUS,
    count: 1,
  },
];
