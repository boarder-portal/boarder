import pick from 'lodash/pick';

import { BaseGamePlayer } from 'common/types';
import { GameOptions, GameType, PlayerSettings } from 'common/types/game';

import Entity, { ParentEntity } from 'common/utilities/Entity';

import Game from 'server/gamesData/Game/Game';

export interface GameEntityContext<G extends GameType> {
  game: Game<G>;
}

export type ParentGameEntity<Game extends GameType> = ParentEntity<GameEntityContext<Game>>;

export default abstract class AbstractGameEntity<Game extends GameType, Result = unknown> extends Entity<
  GameEntityContext<Game>,
  Result
> {
  get options(): GameOptions<Game> {
    return this.getGame().options;
  }

  get playersCount(): number {
    return this.getPlayers().length;
  }

  forEachPlayer(callback: (playerIndex: number, player: BaseGamePlayer<Game>) => unknown): void {
    this.getPlayers().forEach(({ index }) => callback(index, this.getPlayer(index)));
  }

  getGame(): GameEntityContext<Game>['game'] {
    return this.getContext().game;
  }

  getPlayer(playerIndex: number): BaseGamePlayer<Game> {
    return this.getPlayers()[playerIndex];
  }

  getPlayerSettings(playerIndex: number): PlayerSettings<Game> {
    return this.getPlayer(playerIndex)?.settings;
  }

  getPlayers(): BaseGamePlayer<Game>[] {
    return this.getGame().players;
  }

  getPlayersData<Data>(callback: (playerIndex: number) => Data): Data[] {
    return this.getPlayers().map(({ index }) => callback(index));
  }

  getPlayersWithData<Data>(callback: (playerIndex: number) => Data): (BaseGamePlayer<Game> & { data: Data })[] {
    return this.getPlayers().map((player) => ({
      ...pick(player, ['login', 'name', 'status', 'index', 'isBot', 'settings']),
      data: callback(player.index),
    }));
  }
}
