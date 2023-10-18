import { CommonGameClientEvent } from 'common/types';
import { BotSupportedGameType, GameInfo, GameResult, GameType, PlayerSettings } from 'common/types/game';

import { areBotsAvailable } from 'common/utilities/bots';
import Entity, { EntityGenerator } from 'server/gamesData/Game/utilities/Entity/Entity';
import GameInfoComponent from 'server/gamesData/Game/utilities/Entity/components/GameInfo';
import Server from 'server/gamesData/Game/utilities/Entity/components/Server';
import TestCase from 'server/gamesData/Game/utilities/Entity/components/TestCase';
import Time from 'server/gamesData/Game/utilities/Entity/components/Time';
import Bot from 'server/gamesData/Game/utilities/Entity/entities/Bot';
import AbortError from 'server/gamesData/Game/utilities/Entity/utilities/AbortError';

import BombersGame from 'server/gamesData/Game/BombersGame/BombersGame';
import CarcassonneGame from 'server/gamesData/Game/CarcassonneGame/CarcassonneGame';
import Game from 'server/gamesData/Game/Game';
import HeartsGame from 'server/gamesData/Game/HeartsGame/HeartsGame';
import MachiKoroGame from 'server/gamesData/Game/MachiKoroGame/MachiKoroGame';
import MahjongGame from 'server/gamesData/Game/MahjongGame/MahjongGame';
import OnitamaGame from 'server/gamesData/Game/OnitamaGame/OnitamaGame';
import PexesoGame from 'server/gamesData/Game/PexesoGame/PexesoGame';
import RedSevenGame from 'server/gamesData/Game/RedSevenGame/RedSevenGame';
import SetGame from 'server/gamesData/Game/SetGame/SetGame';
import SevenWondersGame from 'server/gamesData/Game/SevenWondersGame/SevenWondersGame';
import SurvivalOnlineGame from 'server/gamesData/Game/SurvivalOnlineGame/SurvivalOnlineGame';

export type GameEntity<Game extends GameType> = Entity<GameResult<Game>> & {
  toJSON(): GameInfo<Game>;
};

export type GameEntityConstructor<Game extends GameType> = new () => GameEntity<Game>;

export interface GameEntityContext<G extends GameType> {
  game: Game<G>;
}

export interface GameEntityOptions<Game extends GameType> {
  context: GameEntityContext<Game>;
}

const GAME_ENTITIES_MAP: {
  [Game in GameType]: GameEntityConstructor<Game>;
} = {
  [GameType.PEXESO]: PexesoGame,
  [GameType.SURVIVAL_ONLINE]: SurvivalOnlineGame,
  [GameType.SET]: SetGame,
  [GameType.ONITAMA]: OnitamaGame,
  [GameType.CARCASSONNE]: CarcassonneGame,
  [GameType.SEVEN_WONDERS]: SevenWondersGame,
  [GameType.HEARTS]: HeartsGame,
  [GameType.BOMBERS]: BombersGame,
  [GameType.MACHI_KORO]: MachiKoroGame,
  [GameType.MAHJONG]: MahjongGame,
  [GameType.RED_SEVEN]: RedSevenGame,
};

export default class GameRoot<Game extends GameType> extends Entity<GameResult<Game>> {
  #time = this.addComponent(Time, {
    isPauseAvailable: () => true,
  });
  #gameInfo = this.obtainComponent(GameInfoComponent<Game, this>);
  #server = this.obtainComponent(Server<Game, this>);

  #gameEntity: GameEntity<Game> | null = null;

  readonly context: GameEntityContext<Game>;

  constructor(options: GameEntityOptions<Game>) {
    super();

    this.context = options.context;

    this.addComponent(TestCase);
  }

  *lifecycle(): EntityGenerator<GameResult<Game>> {
    const GameEntityConstructor: GameEntityConstructor<Game> = GAME_ENTITIES_MAP[this.context.game.game];

    this.spawnTask(this.#spawnBots());
    this.spawnTask(this.#watchSettingChange());

    this.#gameEntity = this.spawnEntity(GameEntityConstructor);

    return yield* this.waitForEntity(this.#gameEntity);
  }

  *#spawnBot(game: BotSupportedGameType, playerIndex: number): EntityGenerator {
    try {
      yield* this.waitForEntity(
        this.spawnEntity(Bot, {
          game,
          playerIndex,
        }),
      );
    } catch (err) {
      if (!(err instanceof AbortError)) {
        console.log(
          new Error(`Bot #${playerIndex} error`, {
            cause: err,
          }),
        );
      }
    }
  }

  *#spawnBots(): EntityGenerator {
    const { game } = this.context.game;

    if (!areBotsAvailable(game)) {
      return;
    }

    yield* this.all(
      this.#gameInfo.players.filter(({ isBot }) => isBot).map(({ index }) => this.#spawnBot(game, index)),
    );
  }

  *#watchSettingChange(): EntityGenerator {
    yield* this.#server.listenForSocketEvent(CommonGameClientEvent.CHANGE_SETTING, ({ data, playerIndex }) => {
      const player = this.#gameInfo.getPlayer(playerIndex);

      player.settings[data.key as keyof PlayerSettings<Game>] = data.value as any;

      this.#server.sendGameInfo();
      this.#server.sendUpdatePlayersEvent();
    });
  }

  getGameInfo(): GameInfo<Game> {
    if (!this.#gameEntity) {
      throw new Error('No game entity');
    }

    return this.#gameEntity.toJSON() as GameInfo<Game>;
  }

  isPauseAvailable(): boolean {
    if (!this.#gameEntity) {
      return false;
    }

    for (const time of this.#gameEntity.getComponents<typeof Time>(Time)) {
      if (time.pauseAvailable) {
        return true;
      }
    }

    return false;
  }

  pause(pausedAt: number): void {
    this.#time.pause(pausedAt);
  }

  unpause(unpausedAt: number): void {
    this.#time.unpause(unpausedAt);
  }
}
