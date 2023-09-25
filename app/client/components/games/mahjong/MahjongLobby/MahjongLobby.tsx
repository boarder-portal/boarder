import { FC, memo } from 'react';

import { GameType } from 'common/types/game';

import Lobby from 'client/components/game/Lobby/Lobby';
import MahjongCreateGameOptions from 'client/components/games/mahjong/MahjongCreateGameOptions/MahjongCreateGameOptions';
import MahjongGameOptions from 'client/components/games/mahjong/MahjongGameOptions/MahjongGameOptions';

const MahjongLobby: FC = () => {
  return (
    <Lobby
      game={GameType.MAHJONG}
      renderGameOptions={MahjongGameOptions}
      renderCreateGameOptions={MahjongCreateGameOptions}
    />
  );
};

export default memo(MahjongLobby);
