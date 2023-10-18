import { BaseObject, ObjectType } from 'common/types/games/survivalOnline';

import Entity, { EntityGenerator } from 'server/gamesData/Game/utilities/Entity/Entity';

import { ServerCell, ServerCellWithEntity } from 'server/gamesData/Game/SurvivalOnlineGame/SurvivalOnlineGame';

export interface BaseOptions {
  cell: ServerCell;
}

export default class Base extends Entity {
  cell: ServerCellWithEntity<Base>;

  constructor(options: BaseOptions) {
    super();

    this.cell = options.cell as ServerCellWithEntity<Base>;
  }

  *lifecycle(): EntityGenerator {
    yield* this.eternity();
  }

  toJSON(): BaseObject {
    return {
      type: ObjectType.BASE,
    };
  }
}
