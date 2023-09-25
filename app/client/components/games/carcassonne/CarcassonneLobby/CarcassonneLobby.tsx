import { FC, memo } from 'react';

import { GameType } from 'common/types/game';

import Lobby from 'client/components/game/Lobby/Lobby';
import CarcassonneCreateGameOptions from 'client/components/games/carcassonne/CarcassonneCreateGameOptions/CarcassonneCreateGameOptions';
import CarcassonneGameOptions from 'client/components/games/carcassonne/CarcassonneGameOptions/CarcassonneGameOptions';

const CarcassonneLobby: FC = () => {
  return (
    <Lobby
      game={GameType.CARCASSONNE}
      renderGameOptions={CarcassonneGameOptions}
      renderCreateGameOptions={CarcassonneCreateGameOptions}
    />
  );
};

export default memo(CarcassonneLobby);
