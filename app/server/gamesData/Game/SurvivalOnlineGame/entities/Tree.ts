import { ObjectType, TreeObject } from 'common/types/games/survivalOnline';

import Entity, { EntityGenerator } from 'server/gamesData/Game/utilities/Entity/Entity';

import { ServerCell, ServerCellWithEntity } from 'server/gamesData/Game/SurvivalOnlineGame/SurvivalOnlineGame';

export interface TreeOptions {
  cell: ServerCell;
}

export default class Tree extends Entity {
  cell: ServerCellWithEntity<Tree>;

  constructor(options: TreeOptions) {
    super();

    this.cell = options.cell as ServerCellWithEntity<Tree>;
  }

  *lifecycle(): EntityGenerator {
    yield* this.eternity();
  }

  toJSON(): TreeObject {
    return {
      type: ObjectType.TREE,
    };
  }
}
