import Entity, { AnyEntity } from 'server/gamesData/Game/utilities/Entity/Entity';

export type EntityComponentConstructor<E extends AnyEntity = AnyEntity> = new (...args: any[]) => EntityComponent<E>;

export type SimpleEntityComponentConstructor<E extends AnyEntity = AnyEntity> = new () => EntityComponent<E>;

export default class EntityComponent<E extends AnyEntity> {
  private readonly _entity: E;

  get entity(): E {
    return this._entity;
  }

  constructor() {
    if (Entity.internalApi.currentComponentEntity === undefined) {
      throw new Error(
        'Creating components using new() is not allowed, use Entity#addComponent/obtainComponent instead',
      );
    }

    this._entity = Entity.internalApi.currentComponentEntity as E;

    Entity.internalApi.onAddComponentCallback?.(
      Entity.internalApi.currentComponentEntity,
      this,
      this.constructor as any,
    );
  }

  onInit(): void {}

  onDestroy(): void {}
}
