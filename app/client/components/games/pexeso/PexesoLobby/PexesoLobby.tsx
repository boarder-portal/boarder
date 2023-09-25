import { FC, memo } from 'react';

import { GameType } from 'common/types/game';

import Lobby from 'client/components/game/Lobby/Lobby';
import PexesoCreateGameOptions from 'client/components/games/pexeso/PexesoCreateGameOptions/PexesoCreateGameOptions';
import PexesoGameOptions from 'client/components/games/pexeso/PexesoGameOptions/PexesoGameOptions';

const PexesoLobby: FC = () => {
  return (
    <Lobby
      game={GameType.PEXESO}
      renderGameOptions={PexesoGameOptions}
      renderCreateGameOptions={PexesoCreateGameOptions}
    />
  );
};

export default memo(PexesoLobby);
