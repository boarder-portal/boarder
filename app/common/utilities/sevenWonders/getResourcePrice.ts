import { ResourceType } from 'common/types/sevenWonders';
import { CardType } from 'common/types/sevenWonders/cards';

export default function getResourceType(resource: ResourceType): CardType.RAW_MATERIAL | CardType.MANUFACTURED_GOODS {
  switch (resource) {
    case ResourceType.CLAY:
    case ResourceType.WOOD:
    case ResourceType.ORE:
    case ResourceType.STONE: {
      return CardType.RAW_MATERIAL;
    }

    case ResourceType.LOOM:
    case ResourceType.PAPYRUS:
    case ResourceType.GLASS: {
      return CardType.MANUFACTURED_GOODS;
    }
  }
}
