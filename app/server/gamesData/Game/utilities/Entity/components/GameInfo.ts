import pick from 'lodash/pick';

import { PORT } from 'server/constants';

import { BaseGamePlayer } from 'common/types';
import { GameOptions, GameType, PlayerSettings } from 'common/types/game';

import Entity, { AnyEntity } from 'server/gamesData/Game/utilities/Entity/Entity';
import EntityComponent from 'server/gamesData/Game/utilities/Entity/EntityComponent';
import GameRoot, { GameEntityContext } from 'server/gamesData/Game/utilities/Entity/entities/GameRoot';
import PlayersData, { PlayersDataOptions } from 'server/gamesData/Game/utilities/Entity/utilities/PlayersData';

export default class GameInfo<Game extends GameType, E extends AnyEntity = Entity> extends EntityComponent<E> {
  #gameRoot = this.entity.getClosestEntity(GameRoot<Game>);

  get game(): GameEntityContext<Game>['game'] {
    return this.#gameRoot.context.game;
  }

  get options(): GameOptions<Game> {
    return this.#gameRoot.context.game.options;
  }

  get players(): BaseGamePlayer<Game>[] {
    return this.#gameRoot.context.game.players;
  }

  get playersCount(): number {
    return this.#gameRoot.context.game.players.length;
  }

  get serverAddress(): string {
    return `http://localhost:${PORT}${this.#gameRoot.context.game.io.name}`;
  }

  createPlayersData<Data>(options: Omit<PlayersDataOptions<Data, E>, 'entity'>): PlayersData<Data> {
    return new PlayersData({
      ...options,
      entity: this.entity,
    });
  }

  forEachPlayer(callback: (playerIndex: number, player: BaseGamePlayer<Game>) => unknown): void {
    this.#gameRoot.context.game.players.forEach(({ index }) => callback(index, this.getPlayer(index)));
  }

  getPlayer(playerIndex: number): BaseGamePlayer<Game> {
    return this.#gameRoot.context.game.players[playerIndex];
  }

  getPlayerSettings(playerIndex: number): PlayerSettings<Game> {
    return this.#gameRoot.context.game.players[playerIndex].settings;
  }

  getPlayersData<Data>(callback: (playerIndex: number) => Data): Data[] {
    return this.#gameRoot.context.game.players.map(({ index }) => callback(index));
  }

  getPlayersWithData<Data>(callback: (playerIndex: number) => Data): (BaseGamePlayer<Game> & { data: Data })[] {
    return this.#gameRoot.context.game.players.map((player) => ({
      ...pick(player, ['login', 'name', 'status', 'index', 'isBot', 'settings']),
      data: callback(player.index),
    }));
  }
}
