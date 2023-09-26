import { FC, memo } from 'react';

import { GameType } from 'common/types/game';

import Game from 'client/components/game/Game/Game';
import GameContent from 'client/components/games/mahjong/MahjongGame/components/GameContent/GameContent';
import Settings from 'client/components/games/mahjong/MahjongGame/components/Settings/Settings';

const MahjongGame: FC = () => {
  return <Game<GameType.MAHJONG> renderGameContent={GameContent} renderSettings={Settings} />;
};

export default memo(MahjongGame);
