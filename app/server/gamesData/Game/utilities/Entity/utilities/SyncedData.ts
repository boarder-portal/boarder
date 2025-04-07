import mapValues from 'lodash/mapValues';

import { AnyEntity } from 'server/gamesData/Game/utilities/Entity/Entity';
import { DataGetter } from 'server/gamesData/Game/utilities/Entity/components/Sync';
import PlayersData from 'server/gamesData/Game/utilities/Entity/utilities/PlayersData';

export interface SyncedDataOptions<Data extends object, E extends AnyEntity> {
  entity: E;
  dataGetter: DataGetter<Data, E>;
}

export default class SyncedData<Data extends object, E extends AnyEntity> {
  entity: E;
  dataGetter: DataGetter<Data, E>;

  constructor(options: SyncedDataOptions<Data, E>) {
    this.entity = options.entity;
    this.dataGetter = options.dataGetter;
  }

  getValue(): Data {
    // @ts-ignore
    return mapValues(this.dataGetter.call(this.entity), (value) => {
      if (value instanceof SyncedData) {
        return value.getValue();
      }

      if (value instanceof PlayersData) {
        return value.toArray();
      }

      return value;
    });
  }
}
