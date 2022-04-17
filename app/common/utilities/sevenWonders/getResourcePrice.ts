import { EResource } from 'common/types/sevenWonders';
import { ECardType } from 'common/types/sevenWonders/cards';

export default function getResourceType(
  resource: EResource,
): ECardType.RAW_MATERIAL | ECardType.MANUFACTURED_GOODS {
  switch (resource) {
    case EResource.CLAY:
    case EResource.WOOD:
    case EResource.ORE:
    case EResource.STONE: {
      return ECardType.RAW_MATERIAL;
    }

    case EResource.LOOM:
    case EResource.PAPYRUS:
    case EResource.GLASS: {
      return ECardType.MANUFACTURED_GOODS;
    }
  }
}
