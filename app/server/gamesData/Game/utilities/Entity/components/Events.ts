import Entity, { AnyEntity, EffectGenerator } from 'server/gamesData/Game/utilities/Entity/Entity';
import EntityComponent from 'server/gamesData/Game/utilities/Entity/EntityComponent';
import Event from 'server/gamesData/Game/utilities/Entity/utilities/Event';

export default class Events<E extends AnyEntity = Entity> extends EntityComponent<E> {
  createEvent<Value = void>(): Event<Value> {
    return new Event();
  }

  *waitForEvent<Value>(event: Event<Value>): EffectGenerator<Value> {
    return yield (resolve) => {
      return event.subscribe(resolve);
    };
  }
}
