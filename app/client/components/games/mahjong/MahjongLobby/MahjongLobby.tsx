import { FC, memo } from 'react';

import { GameType } from 'common/types/game';

import Lobby from 'client/components/game/Lobby/Lobby';
import CreateGameOptions from 'client/components/games/mahjong/MahjongLobby/components/CreateGameOptions/CreateGameOptions';
import GameOptions from 'client/components/games/mahjong/MahjongLobby/components/GameOptions/GameOptions';

const MahjongLobby: FC = () => {
  return <Lobby game={GameType.MAHJONG} renderGameOptions={GameOptions} renderCreateGameOptions={CreateGameOptions} />;
};

export default memo(MahjongLobby);
