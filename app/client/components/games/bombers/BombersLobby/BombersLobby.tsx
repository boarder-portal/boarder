import { FC, memo } from 'react';

import { GameType } from 'common/types/game';

import Lobby from 'client/components/game/Lobby/Lobby';
import BombersCreateGameOptions from 'client/components/games/bombers/BombersCreateGameOptions/BombersCreateGameOptions';
import BombersGameOptions from 'client/components/games/bombers/BombersGameOptions/BombersGameOptions';

const BombersLobby: FC = () => {
  return (
    <Lobby
      game={GameType.BOMBERS}
      renderGameOptions={BombersGameOptions}
      renderCreateGameOptions={BombersCreateGameOptions}
    />
  );
};

export default memo(BombersLobby);
