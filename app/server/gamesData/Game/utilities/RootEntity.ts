import { GameResult, GameType } from 'common/types/game';

import { EntityGenerator } from 'common/utilities/Entity';
import { GameEntityContext } from 'server/gamesData/Game/utilities/AbstractGameEntity';
import BaseGameEntity from 'server/gamesData/Game/utilities/GameEntity';
import ServerEntity from 'server/gamesData/Game/utilities/ServerEntity';

import BombersGame from 'server/gamesData/Game/BombersGame/BombersGame';
import CarcassonneGame from 'server/gamesData/Game/CarcassonneGame/CarcassonneGame';
import HeartsGame from 'server/gamesData/Game/HeartsGame/HeartsGame';
import MachiKoroGame from 'server/gamesData/Game/MachiKoroGame/MachiKoroGame';
import MahjongGame from 'server/gamesData/Game/MahjongGame/MahjongGame';
import OnitamaGame from 'server/gamesData/Game/OnitamaGame/OnitamaGame';
import PexesoGame from 'server/gamesData/Game/PexesoGame/PexesoGame';
import RedSevenGame from 'server/gamesData/Game/RedSevenGame/RedSevenGame';
import SetGame from 'server/gamesData/Game/SetGame/SetGame';
import SevenWondersGame from 'server/gamesData/Game/SevenWondersGame/SevenWondersGame';
import SurvivalOnlineGame from 'server/gamesData/Game/SurvivalOnlineGame/SurvivalOnlineGame';

export type GameEntity<Game extends GameType> = InstanceType<typeof GAME_ENTITIES_MAP[Game]> & BaseGameEntity<Game>;

const GAME_ENTITIES_MAP = {
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

export default class RootEntity<Game extends GameType> extends ServerEntity<Game, GameResult<Game>> {
  gameEntity: GameEntity<Game> | null = null;

  constructor(context: GameEntityContext<Game>) {
    super(null);

    this.context = context;
  }

  *lifecycle(): EntityGenerator<GameResult<Game>> {
    this.gameEntity = new GAME_ENTITIES_MAP[this.getContext().game.game](this as any) as GameEntity<Game>;

    return yield* this.waitForEntity(this.gameEntity);
  }
}
