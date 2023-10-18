import Entity, { AnyEntity } from 'server/gamesData/Game/utilities/Entity/Entity';

export type EntityComponentConstructor<E extends AnyEntity = AnyEntity> = new (...args: any[]) => EntityComponent<E>;

export type SimpleEntityComponentConstructor<E extends AnyEntity = AnyEntity> = new () => EntityComponent<E>;

export default class EntityComponent<E extends AnyEntity> {
  readonly #entity: E;

  get entity(): E {
    return this.#entity;
  }

  constructor() {
    if (Entity.internalApi.currentComponentEntity === undefined) {
      throw new Error(
        'Creating components using new() is not allowed, use Entity#addComponent/obtainComponent instead',
      );
    }

    this.#entity = Entity.internalApi.currentComponentEntity as E;

    Entity.internalApi.onAddComponentCallback?.(
      Entity.internalApi.currentComponentEntity,
      this,
      this.constructor as any,
    );
  }

  onInit(): void {}

  onDestroy(): void {}
}
