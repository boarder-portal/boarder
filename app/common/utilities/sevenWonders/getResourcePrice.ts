import { ESevenWondersResource } from 'common/types/sevenWonders';
import { ESevenWondersCardType } from 'common/types/sevenWonders/cards';

export default function getResourceType(
  resource: ESevenWondersResource,
): ESevenWondersCardType.RAW_MATERIAL | ESevenWondersCardType.MANUFACTURED_GOODS {
  switch (resource) {
    case ESevenWondersResource.CLAY:
    case ESevenWondersResource.WOOD:
    case ESevenWondersResource.ORE:
    case ESevenWondersResource.STONE: {
      return ESevenWondersCardType.RAW_MATERIAL;
    }

    case ESevenWondersResource.LOOM:
    case ESevenWondersResource.PAPYRUS:
    case ESevenWondersResource.GLASS: {
      return ESevenWondersCardType.MANUFACTURED_GOODS;
    }
  }
}
