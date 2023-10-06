export interface TurnControllerOptions<Player> {
  startPlayerIndex?: number;
  players: Player[];
  getNextPlayerIndex?(playerIndex: number): number;
  isPlayerInPlay?(playerIndex: number): boolean;
}

export default class TurnController<Player> {
  activePlayerIndex: number;
  players: Player[];
  getNextPlayerIndexCallback: (playerIndex: number) => number;
  isPlayerInPlayCallback?: (playerIndex: number) => boolean;

  constructor(options: TurnControllerOptions<Player>) {
    this.activePlayerIndex = options.startPlayerIndex ?? 0;
    this.players = options.players;
    this.getNextPlayerIndexCallback =
      options.getNextPlayerIndex ?? ((playerIndex) => (playerIndex + 1) % this.players.length);
    this.isPlayerInPlayCallback = options.isPlayerInPlay;
  }

  getActivePlayer(throwOnNone?: true): Player;
  getActivePlayer(throwOnNone: false): Player | null;
  getActivePlayer(throwOnNone: boolean = true): Player | null {
    const activePlayer = this.players[this.activePlayerIndex] ?? null;

    if (!activePlayer && throwOnNone) {
      throw new Error('No active player');
    }

    return activePlayer;
  }

  getNextActivePlayer(throwOnNone?: true): Player;
  getNextActivePlayer(throwOnNone: false): Player | null;
  getNextActivePlayer(throwOnNone: boolean = true): Player | null {
    const nextActivePlayer = this.players[this.getNextActivePlayerIndex()] ?? null;

    if (!nextActivePlayer && throwOnNone) {
      throw new Error('No active player');
    }

    return nextActivePlayer;
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

  getNextPlayerIndex(playerIndex = this.activePlayerIndex): number {
    return this.getNextPlayerIndexCallback(playerIndex);
  }

  hasActivePlayer(): boolean {
    return this.activePlayerIndex !== -1;
  }

  isPlayerInPlay(playerIndex: number): boolean {
    return this.isPlayerInPlayCallback?.(playerIndex) ?? true;
  }

  passTurn(): void {
    this.activePlayerIndex = this.getNextActivePlayerIndex();
  }

  turnOff(): void {
    this.activePlayerIndex = -1;
  }
}
