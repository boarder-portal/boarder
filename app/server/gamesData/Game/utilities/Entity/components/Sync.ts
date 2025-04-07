import Entity, { AnyEntity } from 'server/gamesData/Game/utilities/Entity/Entity';
import EntityComponent from 'server/gamesData/Game/utilities/Entity/EntityComponent';
import PlayersData from 'server/gamesData/Game/utilities/Entity/utilities/PlayersData';
import SyncedData from 'server/gamesData/Game/utilities/Entity/utilities/SyncedData';

export type SyncedValue<Value, E extends AnyEntity> =
  | Value
  | (Value extends unknown[] ? PlayersData<Value[number], E> : Value extends object ? SyncedData<Value, E> : never);

export type DataGetter<Data extends object, E extends AnyEntity> = () => {
  [Key in keyof Data]: SyncedValue<Data[Key], E>;
};

export default class Sync<E extends AnyEntity = Entity> extends EntityComponent<E> {
  createData<Data extends object>(dataGetter: DataGetter<Data, E>): SyncedData<Data, E> {
    return new SyncedData({
      entity: this.entity,
      dataGetter,
    });
  }
}
