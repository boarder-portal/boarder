import { ComponentType, FC, memo } from 'react';
import { useParams } from 'react-router-dom';

import { GameType } from 'common/types/game';

import { isGame } from 'client/utilities/game';

import BombersLobby from 'client/components/games/bombers/BombersLobby/BombersLobby';
import CarcassonneLobby from 'client/components/games/carcassonne/CarcassonneLobby/CarcassonneLobby';
import HeartsLobby from 'client/components/games/hearts/HeartsLobby/HeartsLobby';
import MachiKoroLobby from 'client/components/games/machiKoro/MachiKoroLobby/MachiKoroLobby';
import MahjongLobby from 'client/components/games/mahjong/MahjongLobby/MahjongLobby';
import OnitamaLobby from 'client/components/games/onitama/OnitamaLobby/OnitamaLobby';
import PexesoLobby from 'client/components/games/pexeso/PexesoLobby/PexesoLobby';
import RedSevenLobby from 'client/components/games/redSeven/RedSevenLobby/RedSevenLobby';
import SetLobby from 'client/components/games/set/SetLobby/SetLobby';
import SevenWondersLobby from 'client/components/games/sevenWonders/SevenWondersLobby/SevenWondersLobby';
import SurvivalOnlineLobby from 'client/components/games/survivalOnline/SurvivalOnlineLobby/SurvivalOnlineLobby';

const LOBBIES_MAP: Record<GameType, ComponentType> = {
  [GameType.PEXESO]: PexesoLobby,
  [GameType.SURVIVAL_ONLINE]: SurvivalOnlineLobby,
  [GameType.SET]: SetLobby,
  [GameType.ONITAMA]: OnitamaLobby,
  [GameType.CARCASSONNE]: CarcassonneLobby,
  [GameType.SEVEN_WONDERS]: SevenWondersLobby,
  [GameType.HEARTS]: HeartsLobby,
  [GameType.BOMBERS]: BombersLobby,
  [GameType.MACHI_KORO]: MachiKoroLobby,
  [GameType.MAHJONG]: MahjongLobby,
  [GameType.RED_SEVEN]: RedSevenLobby,
};

const Lobby: FC = () => {
  const { game } = useParams();

  if (!isGame(game)) {
    return null;
  }

  const Lobby = LOBBIES_MAP[game];

  return <Lobby />;
};

export default memo(Lobby);
