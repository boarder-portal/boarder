import { FC, memo } from 'react';

import { GameType } from 'common/types/game';

import Lobby from 'client/components/game/Lobby/Lobby';
import CreateGameOptions from 'client/components/games/bombers/BombersLobby/components/CreateGameOptions/CreateGameOptions';
import GameOptions from 'client/components/games/bombers/BombersLobby/components/GameOptions/GameOptions';

const BombersLobby: FC = () => {
  return <Lobby<GameType.BOMBERS> renderGameOptions={GameOptions} renderCreateGameOptions={CreateGameOptions} />;
};

export default memo(BombersLobby);
