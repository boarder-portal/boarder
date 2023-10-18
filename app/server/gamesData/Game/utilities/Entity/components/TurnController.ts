import Entity, { AnyEntity } from 'server/gamesData/Game/utilities/Entity/Entity';
import EntityComponent from 'server/gamesData/Game/utilities/Entity/EntityComponent';
import GameInfo from 'server/gamesData/Game/utilities/Entity/components/GameInfo';

export interface TurnControllerOptions<E extends AnyEntity> {
  startPlayerIndex?: number;
  getNextPlayerIndex?(this: E, playerIndex: number): number;
  isPlayerInPlay?(this: E, playerIndex: number): boolean;
}

export default class TurnController<E extends AnyEntity = Entity> extends EntityComponent<E> {
  readonly #getNextPlayerIndexCallback: TurnControllerOptions<E>['getNextPlayerIndex'];
  readonly #isPlayerInPlayCallback: TurnControllerOptions<E>['isPlayerInPlay'];

  readonly #gameInfo = this.entity.obtainComponent(GameInfo);

  activePlayerIndex: number;

  constructor(options?: TurnControllerOptions<E>) {
    super();

    this.activePlayerIndex = options?.startPlayerIndex ?? 0;
    this.#getNextPlayerIndexCallback = options?.getNextPlayerIndex;
    this.#isPlayerInPlayCallback = options?.isPlayerInPlay;
  }

  get hasActivePlayer(): boolean {
    return this.activePlayerIndex !== -1;
  }

  getNextActivePlayerIndex(): number {
    const startPlayerIndex = this.getNextPlayerIndex(this.activePlayerIndex);
    let nextPlayerIndex = startPlayerIndex;

    while (!this.isPlayerInPlay(nextPlayerIndex)) {
      nextPlayerIndex = this.getNextPlayerIndex(nextPlayerIndex);

      if (nextPlayerIndex === startPlayerIndex) {
        return -1;
      }
    }

    return nextPlayerIndex;
  }

  getNextPlayerIndex(playerIndex: number): number {
    return (
      this.#getNextPlayerIndexCallback?.call(this.entity, playerIndex) ??
      (playerIndex + 1) % this.#gameInfo.playersCount
    );
  }

  isPlayerInPlay(playerIndex: number): boolean {
    return this.#isPlayerInPlayCallback?.call(this.entity, playerIndex) ?? true;
  }

  passTurn(): void {
    this.activePlayerIndex = this.getNextActivePlayerIndex();
  }

  turnOff(): void {
    this.activePlayerIndex = -1;
  }
}
