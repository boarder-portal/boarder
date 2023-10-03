import { HydratedDocument, Model } from 'mongoose';

export type ModelInstance<M> = M extends Model<infer T, any, infer TMethodsAndOverrides, infer TVirtuals, any>
  ? HydratedDocument<T, TMethodsAndOverrides, TVirtuals>
  : never;
