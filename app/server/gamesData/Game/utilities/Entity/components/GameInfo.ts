import pick from 'lodash/pick';

import { PORT } from 'server/constants';

import { BaseGamePlayer } from 'common/types';
import { GameOptions, GameType, PlayerSettings } from 'common/types/game';

import Entity, { AnyEntity } from 'server/gamesData/Game/utilities/Entity/Entity';
import EntityComponent from 'server/gamesData/Game/utilities/Entity/EntityComponent';
import GameRoot, { GameEntityContext } from 'server/gamesData/Game/utilities/Entity/entities/GameRoot';

export default class GameInfo<Game extends GameType, E extends AnyEntity = Entity> extends EntityComponent<E> {
  private _gameRoot = this.entity.getClosestEntity(GameRoot<Game>);

  get game(): GameEntityContext<Game>['game'] {
    return this._gameRoot.context.game;
  }

  get options(): GameOptions<Game> {
    return this._gameRoot.context.game.options;
  }

  get players(): BaseGamePlayer<Game>[] {
    return this._gameRoot.context.game.players;
  }

  get playersCount(): number {
    return this._gameRoot.context.game.players.length;
  }

  get serverAddress(): string {
    return `http://localhost:${PORT}${this._gameRoot.context.game.io.name}`;
  }

  forEachPlayer(callback: (playerIndex: number, player: BaseGamePlayer<Game>) => unknown): void {
    this._gameRoot.context.game.players.forEach(({ index }) => callback(index, this.getPlayer(index)));
  }

  getPlayer(playerIndex: number): BaseGamePlayer<Game> {
    return this._gameRoot.context.game.players[playerIndex];
  }

  getPlayerSettings(playerIndex: number): PlayerSettings<Game> {
    return this._gameRoot.context.game.players[playerIndex].settings;
  }

  getPlayersData<Data>(callback: (playerIndex: number) => Data): Data[] {
    return this._gameRoot.context.game.players.map(({ index }) => callback(index));
  }

  getPlayersWithData<Data>(callback: (playerIndex: number) => Data): (BaseGamePlayer<Game> & { data: Data })[] {
    return this._gameRoot.context.game.players.map((player) => ({
      ...pick(player, ['login', 'name', 'status', 'index', 'isBot', 'settings']),
      data: callback(player.index),
    }));
  }
}
