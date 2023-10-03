import { FC, memo } from 'react';

import { GameType } from 'common/types/game';

import Lobby from 'client/components/game/Lobby/Lobby';
import CreateGameOptions from 'client/components/games/pexeso/PexesoLobby/components/CreateGameOptions/CreateGameOptions';
import GameOptions from 'client/components/games/pexeso/PexesoLobby/components/GameOptions/GameOptions';

const PexesoLobby: FC = () => {
  return <Lobby game={GameType.PEXESO} renderGameOptions={GameOptions} renderCreateGameOptions={CreateGameOptions} />;
};

export default memo(PexesoLobby);
