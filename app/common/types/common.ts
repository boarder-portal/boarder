export type MaybePromise<T> = T | Promise<T>;

export type JsonValue = null | number | string | boolean | JsonArray | JsonObject;

export type JsonArray = JsonValue[];

export type JsonObject<Key extends string = string> = {
  [K in Key]: JsonValue;
};
