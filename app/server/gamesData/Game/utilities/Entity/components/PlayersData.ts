import { GameType } from 'common/types/game';

import Entity, { AnyEntity } from 'server/gamesData/Game/utilities/Entity/Entity';
import EntityComponent from 'server/gamesData/Game/utilities/Entity/EntityComponent';
import GameInfo from 'server/gamesData/Game/utilities/Entity/components/GameInfo';
import TurnController from 'server/gamesData/Game/utilities/Entity/components/TurnController';

export interface PlayersDataOptions<Data, E extends AnyEntity> {
  turnController?: TurnController;
  init(this: E, playerIndex: number): Data;
}

export default class PlayersData<Data, E extends AnyEntity = Entity> extends EntityComponent<E> {
  private readonly _gameInfo: GameInfo<GameType>;

  private readonly _optionsTurnController?: TurnController;
  private readonly _data: Data[];

  constructor(options: PlayersDataOptions<Data, E>) {
    super();

    this._gameInfo = this.entity.getClosestComponent(GameInfo<GameType>);
    this._data = this._gameInfo.getPlayersData(options.init.bind(this.entity));
  }

  private get _turnController(): TurnController {
    return this._optionsTurnController ?? this.entity.getClosestComponent(TurnController);
  }

  *entries(): Generator<[number, Data]> {
    for (const entry of this._data.entries()) {
      yield entry;
    }
  }

  every<Narrow extends Data>(callback: (value: Data, index: number) => value is Narrow): this is PlayersData<Narrow, E>;
  every(callback: (playerData: Data, playerIndex: number) => boolean): boolean;
  every(callback: (playerData: Data, playerIndex: number) => boolean): boolean {
    return this._data.every(callback);
  }

  findIndex(callback: (playerData: Data, playerIndex: number) => boolean): number {
    return this._data.findIndex(callback);
  }

  forEach(callback: (playerData: Data, playerIndex: number) => unknown): void {
    this._data.forEach(callback);
  }

  get(playerIndex: number, throwOnNone?: true): Data;
  get(playerIndex: number, throwOnNone: boolean): Data | null;
  get(playerIndex: number, throwOnNone: boolean = true): Data | null {
    const data: Data | null = this._data[playerIndex] ?? null;

    if (!data && throwOnNone) {
      throw new Error(`No player with index ${playerIndex}`);
    }

    return data;
  }

  getActive(throwOnNone?: true): Data;
  getActive(throwOnNone: false): Data | null;
  getActive(throwOnNone: boolean = true): Data | null {
    return this.get(this._turnController.activePlayerIndex, throwOnNone);
  }

  getNextActive(throwOnNone?: true): Data;
  getNextActive(throwOnNone: false): Data | null;
  getNextActive(throwOnNone: boolean = true): Data | null {
    return this.get(this._turnController.getNextActivePlayerIndex(), throwOnNone);
  }

  map<Value>(callback: (playerData: Data, playerIndex: number) => Value): Value[] {
    return this._data.map(callback);
  }

  some(callback: (playerData: Data, playerIndex: number) => boolean): boolean {
    return this._data.some(callback);
  }

  *[Symbol.iterator](): Generator<Data> {
    for (const data of this._data.values()) {
      yield data;
    }
  }

  toArray(): Data[] {
    return this.map((value) => value);
  }
}
