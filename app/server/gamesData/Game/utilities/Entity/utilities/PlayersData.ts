import { GameType } from 'common/types/game';

import Entity, { AnyEntity } from 'server/gamesData/Game/utilities/Entity/Entity';
import GameInfo from 'server/gamesData/Game/utilities/Entity/components/GameInfo';
import TurnController from 'server/gamesData/Game/utilities/Entity/components/TurnController';

export interface PlayersDataOptions<Data, E extends AnyEntity> {
  entity: E;
  turnController?: TurnController;
  init(this: E, playerIndex: number): Data;
}

export default class PlayersData<Data, E extends AnyEntity = Entity> {
  readonly #entity: E;
  readonly #gameInfo: GameInfo<GameType, E>;

  readonly #optionsTurnController?: TurnController;
  readonly #data: Data[];

  constructor(options: PlayersDataOptions<Data, E>) {
    this.#entity = options.entity;
    this.#gameInfo = this.#entity.obtainComponent(GameInfo<GameType, E>);
    this.#data = this.#gameInfo.getPlayersData(options.init.bind(this.#entity));
  }

  get #turnController(): TurnController {
    return this.#optionsTurnController ?? this.#entity.getClosestComponent(TurnController);
  }

  *entries(): Generator<[number, Data]> {
    for (const entry of this.#data.entries()) {
      yield entry;
    }
  }

  every<Narrow extends Data>(callback: (value: Data, index: number) => value is Narrow): this is PlayersData<Narrow, E>;
  every(callback: (playerData: Data, playerIndex: number) => boolean): boolean;
  every(callback: (playerData: Data, playerIndex: number) => boolean): boolean {
    return this.#data.every(callback);
  }

  findIndex(callback: (playerData: Data, playerIndex: number) => boolean): number {
    return this.#data.findIndex(callback);
  }

  forEach(callback: (playerData: Data, playerIndex: number) => unknown): void {
    this.#data.forEach(callback);
  }

  get(playerIndex: number, throwOnNone?: true): Data;
  get(playerIndex: number, throwOnNone: boolean): Data | null;
  get(playerIndex: number, throwOnNone: boolean = true): Data | null {
    const data: Data | null = this.#data[playerIndex] ?? null;

    if (!data && throwOnNone) {
      throw new Error(`No player with index ${playerIndex}`);
    }

    return data;
  }

  getActive(throwOnNone?: true): Data;
  getActive(throwOnNone: false): Data | null;
  getActive(throwOnNone: boolean = true): Data | null {
    return this.get(this.#turnController.activePlayerIndex, throwOnNone);
  }

  getNextActive(throwOnNone?: true): Data;
  getNextActive(throwOnNone: false): Data | null;
  getNextActive(throwOnNone: boolean = true): Data | null {
    return this.get(this.#turnController.getNextActivePlayerIndex(), throwOnNone);
  }

  map<Value>(callback: (playerData: Data, playerIndex: number) => Value): Value[] {
    return this.#data.map(callback);
  }

  some(callback: (playerData: Data, playerIndex: number) => boolean): boolean {
    return this.#data.some(callback);
  }

  *[Symbol.iterator](): Generator<Data> {
    for (const data of this.#data.values()) {
      yield data;
    }
  }

  toArray(): Data[] {
    return this.map((value) => value);
  }
}
