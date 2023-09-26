import { FC, memo } from 'react';

import { GameType } from 'common/types/game';

import Lobby from 'client/components/game/Lobby/Lobby';
import CreateGameOptions from 'client/components/games/sevenWonders/SevenWondersLobby/components/CreateGameOptions/CreateGameOptions';
import GameOptions from 'client/components/games/sevenWonders/SevenWondersLobby/components/GameOptions/GameOptions';

const SevenWondersLobby: FC = () => {
  return <Lobby<GameType.SEVEN_WONDERS> renderGameOptions={GameOptions} renderCreateGameOptions={CreateGameOptions} />;
};

export default memo(SevenWondersLobby);
