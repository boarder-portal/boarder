import { ComponentType, FC, memo } from 'react';
import { useParams } from 'react-router-dom';

import { GameType } from 'common/types/game';

import { isGame } from 'client/utilities/game';

import BombersGame from 'client/components/games/bombers/BombersGame/BombersGame';
import CarcassonneGame from 'client/components/games/carcassonne/CarcassonneGame/CarcassonneGame';
import HeartsGame from 'client/components/games/hearts/HeartsGame/HeartsGame';
import MachiKoroGame from 'client/components/games/machiKoro/MachiKoroGame/MachiKoroGame';
import MahjongGame from 'client/components/games/mahjong/MahjongGame/MahjongGame';
import OnitamaGame from 'client/components/games/onitama/OnitamaGame/OnitamaGame';
import PexesoGame from 'client/components/games/pexeso/PexesoGame/PexesoGame';
import RedSevenGame from 'client/components/games/redSeven/RedSevenGame/RedSevenGame';
import SetGame from 'client/components/games/set/SetGame/SetGame';
import SevenWondersGame from 'client/components/games/sevenWonders/SevenWondersGame/SevenWondersGame';
import SurvivalOnlineGame from 'client/components/games/survivalOnline/SurvivalOnlineGame/SurvivalOnlineGame';

const GAMES_MAP: Record<GameType, ComponentType> = {
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

const Game: FC = () => {
  const { game } = useParams();

  if (!isGame(game)) {
    return null;
  }

  const Game = GAMES_MAP[game];

  return <Game />;
};

export default memo(Game);
