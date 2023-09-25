import { FC, memo } from 'react';

import { GameType } from 'common/types/game';

import Lobby from 'client/components/game/Lobby/Lobby';
import SevenWondersCreateGameOptions from 'client/components/games/sevenWonders/SevenWondersCreateGameOptions/SevenWondersCreateGameOptions';
import SevenWondersGameOptions from 'client/components/games/sevenWonders/SevenWondersGameOptions/SevenWondersGameOptions';

const SevenWondersLobby: FC = () => {
  return (
    <Lobby
      game={GameType.SEVEN_WONDERS}
      renderGameOptions={SevenWondersGameOptions}
      renderCreateGameOptions={SevenWondersCreateGameOptions}
    />
  );
};

export default memo(SevenWondersLobby);
