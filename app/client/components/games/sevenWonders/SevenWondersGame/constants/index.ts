import { Resource, ResourceType } from 'common/types/games/sevenWonders';

export const ANY_RAW_RESOURCE_VARIANT: Resource[] = [
  {
    type: ResourceType.WOOD,
    count: 1,
  },
  {
    type: ResourceType.ORE,
    count: 1,
  },
  {
    type: ResourceType.CLAY,
    count: 1,
  },
  {
    type: ResourceType.STONE,
    count: 1,
  },
];

export const ANY_MANUFACTURED_GOOD_RESOURCE_VARIANT: Resource[] = [
  {
    type: ResourceType.GLASS,
    count: 1,
  },
  {
    type: ResourceType.LOOM,
    count: 1,
  },
  {
    type: ResourceType.PAPYRUS,
    count: 1,
  },
];
