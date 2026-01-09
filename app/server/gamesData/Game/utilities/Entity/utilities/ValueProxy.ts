import isPlainObject from 'lodash/isPlainObject';

import Timestamp from 'common/utilities/Timestamp';
import { isArray, isDefined } from 'common/utilities/is';
import Entity from 'server/gamesData/Game/utilities/Entity/Entity';
import EntityComponent from 'server/gamesData/Game/utilities/Entity/EntityComponent';

export interface ValueProxyWrapOptions {
  onAccessProperty(proxy: unknown, property: string | symbol): void;
  onChangeProperty(proxy: unknown, property: string | symbol): void;
}

export default class ValueProxy {
  private static readonly _existingProxySymbol = Symbol();
  private static readonly _isValueProxySymbol = Symbol();

  static wrap<T>(value: T, options: ValueProxyWrapOptions): T {
    if (
      typeof value !== 'object' ||
      !isDefined(value) ||
      value[ValueProxy._isValueProxySymbol as keyof T] ||
      (!isPlainObject(value) &&
        !isArray(value) &&
        [Entity, EntityComponent, Timestamp].every((constructor) => !(value instanceof constructor)))
    ) {
      return value;
    }

    return ValueProxy.wrapObject(value, options);
  }

  static wrapObject<T extends object>(target: T, options: ValueProxyWrapOptions): T {
    if (target[ValueProxy._existingProxySymbol as keyof T]) {
      return target[ValueProxy._existingProxySymbol as keyof T] as T;
    }

    const proxy = new Proxy(target, {
      get(target, property, receiver) {
        if (property === ValueProxy._isValueProxySymbol) {
          return true;
        }

        options.onAccessProperty(proxy, property);

        return Reflect.get(target, property, receiver);
      },

      set(target, property, value, receiver) {
        const wrappedValue = ValueProxy.wrap(value, options);

        options.onChangeProperty(proxy, property);

        return Reflect.set(target, property, wrappedValue, receiver);
      },

      deleteProperty(target, property) {
        options.onChangeProperty(proxy, property);

        return Reflect.deleteProperty(target, property);
      },
    });

    target[ValueProxy._existingProxySymbol as keyof T] = proxy as any;

    for (const property of Object.getOwnPropertyNames(target)) {
      target[property as keyof T] = ValueProxy.wrap(target[property as keyof T], options);
    }

    return proxy;
  }
}
