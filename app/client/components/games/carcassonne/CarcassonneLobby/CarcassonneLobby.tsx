import { FC, memo } from 'react';

import { GameType } from 'common/types/game';

import Lobby from 'client/components/game/Lobby/Lobby';
import CreateGameOptions from 'client/components/games/carcassonne/CarcassonneLobby/components/CreateGameOptions/CreateGameOptions';
import GameOptions from 'client/components/games/carcassonne/CarcassonneLobby/components/GameOptions/GameOptions';

const CarcassonneLobby: FC = () => {
  return <Lobby<GameType.CARCASSONNE> renderGameOptions={GameOptions} renderCreateGameOptions={CreateGameOptions} />;
};

export default memo(CarcassonneLobby);
