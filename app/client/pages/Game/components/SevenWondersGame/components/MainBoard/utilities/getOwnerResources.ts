import { ISevenWondersResource, TSevenWondersResourceOwner } from 'common/types/sevenWonders';
import {
  IOwnerResource,

} from 'client/pages/Game/components/SevenWondersGame/components/MainBoard/types';

/**
 * resources: [
 *    [{ type: 'WOOD', count: 1 }, { type: 'STONE', count: 1 }],
 *    [{ type: 'CLAY', count: 2 }],
 *    [{ type: 'GLASS', count: 1 }],
 * ]
 *
 * owner - объект игрока
 *
 * [
 *    [{ type: 'WOOD', count: 1, owner }, { type: 'STONE', count: 1, owner }],
 *    [{ type: 'CLAY', count: 2, owner }],
 *    [{ type: 'GLASS', count: 1, owner }],
 * ]
 */
export default function getOwnerResources(resources: ISevenWondersResource[][], owner: TSevenWondersResourceOwner): IOwnerResource[][] {
  return resources
    .map((resource) =>
      resource.map((resourceVariant) => ({
        ...resourceVariant,
        owner,
      })),
    );
}
