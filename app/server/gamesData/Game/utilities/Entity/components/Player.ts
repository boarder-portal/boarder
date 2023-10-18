import Entity, { AnyEntity } from 'server/gamesData/Game/utilities/Entity/Entity';
import EntityComponent from 'server/gamesData/Game/utilities/Entity/EntityComponent';

export interface PlayerOptions {
  index: number;
}

export default class Player<E extends AnyEntity = Entity> extends EntityComponent<E> {
  readonly index: number;

  constructor(options: PlayerOptions) {
    super();

    this.index = options.index;
  }
}
